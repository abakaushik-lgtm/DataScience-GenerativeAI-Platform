from typing import Dict, Any, Optional
import logging
from app.services.llm_service import llm_service

class CopilotService:
    @staticmethod
    def query_copilot(prompt: str, context_data: Optional[Dict[str, Any]] = None) -> str:
        """
        Omnichannel AI Copilot logic.
        Handles:
        - Explaining charts
        - Suggesting analyses
        - Recommending models
        - Generating Python / SQL code
        """
        system_prompt = """
        You are the AntiGravity AI Data Science Copilot. 
        You are a world-class Lead Data Scientist. 
        
        Your capabilities:
        1. **Explain Charts:** If the user asks about a chart or data in their context, explain it in clear, plain English, highlighting trends and anomalies.
        2. **Suggest Analyses:** If the user asks what to do next, suggest 3 highly impactful analytical paths (e.g., LTV analysis, Churn prediction) based on their data context.
        3. **Recommend Models:** If asked about predictive modeling, recommend specific algorithms (e.g., XGBoost over Random Forest for specific shapes of data) and explain why.
        4. **Generate Code:** If asked to generate Python or SQL, write production-grade, highly-optimized code. Use Markdown code blocks natively. Include comments.

        Context constraints:
        - Format your output natively in Markdown. 
        - Always provide clear, actionable insights. 
        - Be concise but highly technical when discussing ML models or Python code.
        """
        
        if context_data:
            system_prompt += f"\n\nHere is the user's current context (data, schema, or chart info):\n{context_data}\n\nUse this context to accurately inform your answers."
            
        try:
            from langchain_core.prompts import ChatPromptTemplate
            chat_prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("user", "{user_prompt}")
            ])
            
            chain = chat_prompt | llm_service.llm
            response = chain.invoke({"user_prompt": prompt})
            return response.content
            
        except Exception as e:
            logging.error(f"Copilot Service Error: {str(e)}")
            return "The AI Copilot is currently offline due to a connection error or missing API keys. Please check the server logs."

copilot_service = CopilotService()
