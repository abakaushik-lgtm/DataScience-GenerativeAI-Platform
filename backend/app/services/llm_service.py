import os
import json
import logging
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class LLMService:
    def __init__(self):
        # Allow toggling between OpenAI and Local Ollama
        self.provider = os.getenv("LLM_PROVIDER", "openai").lower()
        self.is_mock = False
        
        if self.provider == "ollama":
            try:
                from langchain_community.chat_models import ChatOllama
                model_name = os.getenv("OLLAMA_MODEL", "llama3")
                self.llm = ChatOllama(model=model_name, temperature=0.1)
            except ImportError:
                logging.warning("langchain_community not installed. Falling back to MockLLM.")
                self.llm = self._get_mock_llm()
                self.is_mock = True
        else:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and not api_key.startswith("dummy"):
                self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=api_key)
            else:
                logging.warning("OPENAI_API_KEY not found or is dummy. Using MockLLM.")
                self.llm = self._get_mock_llm()
                self.is_mock = True

    def _get_mock_llm(self):
        class MockLLM:
            def invoke(self, *args, **kwargs):
                class MockResponse:
                    content = "Mocked LLM Response."
                return MockResponse()
        return MockLLM()

    def generate_sql(self, question: str, schema_info: str) -> str:
        """
        Converts a natural language question into a SQL query based on the schema.
        """
        if self.is_mock:
            return "SELECT * FROM sales LIMIT 10; -- MOCKED DUE TO MISSING API KEY"

        system_prompt = (
            "You are an expert SQL Data Analyst. Given the database schema below, "
            "write an optimized, correct SQL query to answer the user's question. "
            "Return ONLY the raw SQL query, without any markdown formatting or explanations.\n\n"
            "SCHEMA:\n{schema_info}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{question}")
        ])
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            sql_query = chain.invoke({"question": question, "schema_info": schema_info})
            sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
            return sql_query
        except Exception as e:
            if "Incorrect API key" in str(e) or "dummy-key" in str(e):
                return "SELECT * FROM sales LIMIT 10; -- MOCKED DUE TO MISSING API KEY"
            raise e

    def generate_explanation(self, question: str, sql_query: str, query_results: str) -> str:
        """
        Generates a natural language explanation of the query results.
        """
        if self.is_mock:
            return "This is a mocked explanation because the OpenAI API key is missing. The data shows some interesting trends."

        system_prompt = (
            "You are an expert Data Analyst presenting findings to a business executive. "
            "The user asked a question, a SQL query was run, and the results are provided below. "
            "Provide a concise, easy-to-understand explanation of the results. "
            "Highlight any key insights. Do not mention the SQL query itself unless relevant.\n\n"
            "QUESTION: {question}\n"
            "SQL EXECUTED: {sql_query}\n"
            "RESULTS:\n{query_results}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Explain the findings.")
        ])
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            explanation = chain.invoke({
                "question": question, 
                "sql_query": sql_query, 
                "query_results": str(query_results)
            })
            return explanation
        except Exception as e:
             if "Incorrect API key" in str(e) or "dummy-key" in str(e):
                return "This is a mocked explanation because the OpenAI API key is missing. The data shows some interesting trends."
             raise e

    def generate_chart_config(self, question: str, data: list) -> dict:
        """
        Generates an Apache ECharts JSON configuration based on the user's question and the SQL result data.
        Returns None if no chart is suitable.
        """
        if not data or len(data) == 0:
            return None

        if self.is_mock:
            keys = list(data[0].keys())
            if len(keys) >= 2:
                return {
                    "tooltip": {"trigger": "axis"},
                    "xAxis": {"type": "category", "data": [str(row[keys[0]]) for row in data[:5]]},
                    "yAxis": {"type": "value"},
                    "series": [{"data": [row[keys[1]] for row in data[:5]], "type": "bar", "itemStyle": {"color": "#6366f1"}}]
                }
            return None

        system_prompt = (
            "You are an expert Data Visualization Engineer using Apache ECharts. "
            "Given a user's question and a dataset (list of JSON objects), determine if a visualization "
            "is appropriate (Line, Bar, Histogram, Heatmap, Scatter, Geo). "
            "If yes, return ONLY a valid JSON object representing the ECharts `option` configuration for this data. "
            "Do not include markdown or ```json backticks. Ensure colors use hex codes like #6366f1, #10b981. "
            "If no chart is appropriate (e.g. asking for a single number), return an empty JSON object: {{}}.\n\n"
            "QUESTION: {question}\n"
            "DATA SNIPPET (first 10 rows): {data}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt)
        ])
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            data_snippet = data[:10]
            config_str = chain.invoke({"question": question, "data": str(data_snippet)})
            config_str = config_str.replace("```json", "").replace("```", "").strip()
            
            if not config_str or config_str == "{}":
                return None
                
            return json.loads(config_str)
        except Exception as e:
            if "Incorrect API key" in str(e) or "dummy-key" in str(e):
                keys = list(data[0].keys())
                if len(keys) >= 2:
                    return {
                        "tooltip": {"trigger": "axis"},
                        "xAxis": {"type": "category", "data": [str(row[keys[0]]) for row in data[:5]]},
                        "yAxis": {"type": "value"},
                        "series": [{"data": [row[keys[1]] for row in data[:5]], "type": "bar", "itemStyle": {"color": "#6366f1"}}]
                    }
            return None

# Singleton instance
llm_service = LLMService()
