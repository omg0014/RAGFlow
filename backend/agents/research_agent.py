from langchain.agents import initialize_agent, AgentType
from core.llm import llm
from tools.search_tool import web_search_tool


tools = [web_search_tool]

research_agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=5
)
