import unittest
from gateway_cli.features.sandbox_generator.index import SandboxService, CreateSandboxRequest
from gateway_cli.infra.adapters.sandbox_adapter import MemorySandboxAdapter


class TestSandboxGenerator(unittest.TestCase):
    def setUp(self) -> None:
        self.adapter = MemorySandboxAdapter()
        self.service = SandboxService(self.adapter)

    def test_provision_sandbox(self) -> None:
        req = CreateSandboxRequest(name="test-env", isolated_network=True, mock_dependencies=["redis"])
        res = self.service.provision(req)
        
        self.assertTrue(res.sandbox_id.startswith("sbx-"))
        self.assertEqual(res.name, "test-env")
        self.assertEqual(res.status, "active")
        self.assertTrue(res.namespace.startswith("sandbox-"))
        self.assertEqual(res.mock_dependencies, ["redis"])

    def test_list_sandboxes(self) -> None:
        req = CreateSandboxRequest(name="env-1")
        self.service.provision(req)
        sandboxes = self.service.list_all()
        self.assertEqual(len(sandboxes), 1)

    def test_terminate_sandbox(self) -> None:
        req = CreateSandboxRequest(name="env-to-delete")
        res = self.service.provision(req)
        
        terminated = self.service.terminate(res.sandbox_id)
        self.assertTrue(terminated)
        self.assertIsNone(self.service.get_by_id(res.sandbox_id))


if __name__ == "__main__":
    unittest.main()
