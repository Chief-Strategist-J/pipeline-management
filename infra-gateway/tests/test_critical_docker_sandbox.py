import os
import unittest
from gateway_cli.features.sandbox_generator.index import SandboxService, CreateSandboxRequest
from gateway_cli.infra.adapters.docker_sandbox_adapter import DockerSandboxAdapter


class TestCriticalDockerSandbox(unittest.TestCase):
    def setUp(self) -> None:
        self.adapter = DockerSandboxAdapter()
        self.service = SandboxService(self.adapter)
        self.created_sandboxes = []

    def tearDown(self) -> None:
        # Cleanup any sandboxes created during tests
        for sb_id in self.created_sandboxes:
            self.service.terminate(sb_id)

    def test_create_and_destroy_real_docker_sandbox(self) -> None:
        """Critical Test 1: Verify real Docker container creation and clean deletion."""
        req = CreateSandboxRequest(name="crit-test-1", isolated_network=True, mock_dependencies=["redis"])
        res = self.service.provision(req)
        self.created_sandboxes.append(res.sandbox_id)

        self.assertTrue(res.sandbox_id.startswith("sbx-"))
        self.assertEqual(res.status, "active")

        # Verify container exists
        sb = self.service.get_by_id(res.sandbox_id)
        self.assertIsNotNone(sb)
        self.assertEqual(sb.name, "crit-test-1")

        # Terminate and verify clean deletion
        terminated = self.service.terminate(res.sandbox_id)
        self.assertTrue(terminated)
        self.assertIsNone(self.service.get_by_id(res.sandbox_id))

    def test_non_existent_sandbox_destruction(self) -> None:
        """Critical Test 2: Ensure destroying a non-existent sandbox handles gracefully."""
        result = self.service.terminate("sbx-nonexistent-id")
        self.assertFalse(result)

    def test_multiple_sandboxes_isolation(self) -> None:
        """Critical Test 3: Ensure multiple sandboxes run with independent namespaces."""
        req1 = CreateSandboxRequest(name="env-alpha", mock_dependencies=["redis"])
        req2 = CreateSandboxRequest(name="env-beta", mock_dependencies=["nginx"])

        res1 = self.service.provision(req1)
        res2 = self.service.provision(req2)
        self.created_sandboxes.extend([res1.sandbox_id, res2.sandbox_id])

        self.assertNotEqual(res1.sandbox_id, res2.sandbox_id)
        self.assertNotEqual(res1.namespace, res2.namespace)

        all_sandboxes = self.service.list_all()
        ids = [sb.sandbox_id for sb in all_sandboxes]
        self.assertIn(res1.sandbox_id, ids)
        self.assertIn(res2.sandbox_id, ids)


if __name__ == "__main__":
    unittest.main()
