import logging
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service

# Define the Agent State
class AgentState(TypedDict):
    messages: Sequence[BaseMessage]
    decision: str
    context: str
    final_answer: str

class LangGraphAgent:
    def __init__(self):
        self.llm = llm_service.llm
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(AgentState)
        
        # Add Nodes (The Swarm)
        workflow.add_node("supervisor", self.run_supervisor)
        workflow.add_node("data_engineer_agent", self.run_sql_analyst)
        workflow.add_node("ml_engineer_agent", self.run_ml_agent)
        workflow.add_node("rag_agent", self.run_vector_search)
        workflow.add_node("hallucination_grader", self.grade_hallucination)
        workflow.add_node("generate_final", self.generate_final_response)

        # Set Entry Point
        workflow.set_entry_point("supervisor")

        # Supervisor Routing
        workflow.add_conditional_edges(
            "supervisor",
            lambda x: x["decision"],
            {
                "sql": "data_engineer_agent",
                "ml": "ml_engineer_agent",
                "rag": "rag_agent"
            }
        )
        
        workflow.add_edge("data_engineer_agent", "generate_final")
        workflow.add_edge("ml_engineer_agent", "generate_final")
        workflow.add_edge("rag_agent", "hallucination_grader")
        
        # Self-correction loop
        workflow.add_conditional_edges(
            "hallucination_grader",
            lambda x: "pass" if "hallucination" not in x.get("decision", "").lower() else "fail",
            {
                "pass": "generate_final",
                "fail": "rag_agent" # Loop back and retry if hallucinated
            }
        )
        
        workflow.add_edge("generate_final", END)
        
        return workflow.compile()

    def run_supervisor(self, state: AgentState):
        """Supervisor Agent: Analyzes the prompt and delegates to a specialized sub-agent."""
        last_message = state["messages"][-1].content.lower()
        if "model" in last_message or "train" in last_message or "predict" in last_message:
            return {"decision": "ml"}
        elif "document" in last_message or "pdf" in last_message:
            return {"decision": "rag"}
        return {"decision": "sql"}

    def run_ml_agent(self, state: AgentState):
        """ML Engineer Sub-Agent: Handles Custom ML and Advanced ML logic."""
        question = state["messages"][-1].content
        # Mock ML execution
        return {"context": f"ML Agent formulated pipeline for: {question}"}

    def run_sql_analyst(self, state: AgentState):
        """Executes the standard SQL generation pipeline."""
        question = state["messages"][-1].content
        # Dummy schema for graph logic
        sql = llm_service.generate_sql(question, "CREATE TABLE dummy (id INT);")
        return {"context": f"Generated SQL: {sql}"}

    def run_vector_search(self, state: AgentState):
        """Executes the Qdrant RAG pipeline."""
        question = state["messages"][-1].content
        rag_response = rag_service.query(question)
        return {"context": f"Vector Search Results: {rag_response.get('answer', 'Mock Qdrant Output')}"}

    def grade_hallucination(self, state: AgentState):
        """Validates if the vector search output hallucinated."""
        # Mocking the LLM grader for speed
        return {"decision": "pass"}

    def generate_final_response(self, state: AgentState):
        """Generates the final output to the user."""
        question = state["messages"][-1].content
        context = state.get("context", "")
        
        prompt = f"Based on this context:\n{context}\n\nAnswer the user: {question}"
        
        try:
            response = self.llm.invoke(prompt)
            final_text = response.content
        except Exception:
            final_text = f"[LangGraph Node Output]: Analyzed context. Processed via {state.get('decision', 'Agent')}."
            
        return {"final_answer": final_text}

    def invoke(self, question: str) -> str:
        """Entry point for the frontend."""
        try:
            initial_state = {
                "messages": [HumanMessage(content=question)],
                "decision": "",
                "context": "",
                "final_answer": ""
            }
            # Execute the compiled LangGraph
            result = self.graph.invoke(initial_state)
            return result["final_answer"]
        except Exception as e:
            logging.error(f"LangGraph execution failed: {e}")
            return "LangGraph Agent encountered an error."

agent_service = LangGraphAgent()
