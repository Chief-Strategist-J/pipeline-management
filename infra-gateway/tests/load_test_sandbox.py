import concurrent.futures
import datetime
import multiprocessing
import os
import sys
import time

# Ensure gateway_cli is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../src"))

from gateway_cli.features.sandbox_generator.index import SandboxService, CreateSandboxRequest
from gateway_cli.infra.adapters.docker_sandbox_adapter import DockerSandboxAdapter


def worker_task(worker_id: int) -> float:
    adapter = DockerSandboxAdapter()
    service = SandboxService(adapter)
    
    start_time = time.time()
    req = CreateSandboxRequest(
        name=f"load-test-worker-{worker_id}",
        isolated_network=True,
        mock_dependencies=["redis"]
    )
    res = service.provision(req)
    creation_time = time.time() - start_time
    
    # Cleanup after test creation
    service.terminate(res.sandbox_id)
    return creation_time


def main():
    concurrency = 5
    total_requests = 10

    print(f"=== Starting Sandbox Generator Load Test ===")
    print(f"Concurrency: {concurrency} workers")
    print(f"Total Sandboxes Provisioned & Teardown: {total_requests}")
    print("--------------------------------------------")

    start_all = time.time()
    latencies = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(worker_task, i) for i in range(total_requests)]
        for future in concurrent.futures.as_completed(futures):
            try:
                lat = future.result()
                latencies.append(lat)
            except Exception as e:
                print(f"[Error] Task failed: {e}")

    total_duration = time.time() - start_all
    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    throughput = total_requests / total_duration if total_duration > 0 else 0

    print("--------------------------------------------")
    print(f"Load Test Completed in: {total_duration:.2f} seconds")
    print(f"Throughput: {throughput:.2f} sandbox operations/sec")
    print(f"Average Latency: {avg_latency:.2f} seconds/sandbox")
    print(f"Min Latency: {min(latencies):.2f}s | Max Latency: {max(latencies):.2f}s")
    print("============================================")


if __name__ == "__main__":
    main()
