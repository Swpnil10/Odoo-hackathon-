from abc import ABC, abstractmethod
from typing import Any, Dict, List

class BaseLLMService(ABC):
    """
    Abstract Base LLM Service interface.
    Ensures any replacement provider implements identical contract methods.
    """
    @abstractmethod
    def summarize_policy(self, policy_text: str) -> List[str]:
        """
        Summarizes the policy text into exactly 3 bullet points.
        
        Args:
            policy_text (str): The policy document text content.
            
        Returns:
            List[str]: A list containing exactly 3 bullet points.
        """
        pass

    @abstractmethod
    def generate_esg_insights(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates structured ESG performance analytics.
        
        Args:
            metrics (Dict[str, Any]): Dictionary containing department performance metrics.
            
        Returns:
            Dict[str, Any]: Dictionary containing 'overall_health' and 'insight'.
        """
        pass

    @abstractmethod
    def generate_sustainability_advice(self, question: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates conversational ESG advice based on a user question and metrics.
        
        Args:
            question (str): User question.
            metrics (Dict[str, Any]): Dictionary of department metrics.
            
        Returns:
            Dict[str, Any]: Dictionary containing the answer.
        """
        pass
