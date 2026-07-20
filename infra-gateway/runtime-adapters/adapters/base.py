import os
import yaml

class ProxyAdapter:
    """Base interface for all proxy runtime-adapters."""
    
    def generate(self, base_dir: str, output_dir: str) -> None:
        """Translates the abstract configurations into target proxy configurations."""
        raise NotImplementedError("Adapters must implement the generate method.")

    @staticmethod
    def parse_yaml(filepath: str) -> dict:
        """Utility method to parse YAML configuration files."""
        if not os.path.exists(filepath):
            return {}
        with open(filepath, 'r') as f:
            try:
                data = yaml.safe_load(f)
                return data if data is not None else {}
            except Exception as e:
                print(f"Error parsing {filepath}: {e}")
                return {}
