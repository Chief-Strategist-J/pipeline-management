#!/usr/bin/env python3
"""
Infrastructure Gateway & Next.js Performance Load Testing Benchmark Suite
Concurrently stress-tests the API endpoints (/api/ocsp, /api/compile, /api/sandbox)
and measures Requests Per Second (RPS), p50, p95, p99 latencies, and error rates.
"""

import concurrent.futures
import json
import math
import time
import urllib.request
import urllib.parse
import sys

BASE_URL = "http://localhost:3000"
NUM_WORKERS = 10
TOTAL_REQUESTS = 200

endpoints = [
  {"name": "GET /api/ocsp", "url": f"{BASE_URL}/api/ocsp", "method": "GET"},
  {"name": "GET /api/ocsp?target=nginx", "url": f"{BASE_URL}/api/ocsp?target=nginx", "method": "GET"},
  {"name": "POST /api/compile", "url": f"{BASE_URL}/api/compile", "method": "POST", "body": json.dumps({"proxy": "all"}).encode("utf-8")},
  {"name": "GET /api/sandbox", "url": f"{BASE_URL}/api/sandbox", "method": "GET"},
]


def send_request(endpoint):
  start = time.perf_counter()
  try:
    req = urllib.request.Request(
      endpoint["url"],
      data=endpoint.get("body"),
      headers={"Content-Type": "application/json"} if endpoint.get("body") else {},
      method=endpoint["method"],
    )
    with urllib.request.urlopen(req, timeout=10) as response:
      _ = response.read()
      elapsed_ms = (time.perf_counter() - start) * 1000
      return elapsed_ms, response.status == 200
  except Exception as e:
    elapsed_ms = (time.perf_counter() - start) * 1000
    return elapsed_ms, False


def calculate_percentile(sorted_list, percentile):
  if not sorted_list:
    return 0.0
  k = (len(sorted_list) - 1) * (percentile / 100.0)
  f = math.floor(k)
  c = math.ceil(k)
  if f == c:
    return sorted_list[int(k)]
  d0 = sorted_list[int(f)] * (c - k)
  d1 = sorted_list[int(c)] * (k - f)
  return d0 + d1


def run_benchmark():
  print("=========================================================================")
  print("🚀 INFRASTRUCTURE GATEWAY & NEXT.JS PERFORMANCE BENCHMARK & LOAD TEST")
  print("=========================================================================")
  print(f"Target Base URL : {BASE_URL}")
  print(f"Concurrent Workers: {NUM_WORKERS}")
  print(f"Total Requests  : {TOTAL_REQUESTS}")
  print("-------------------------------------------------------------------------")

  request_queue = [endpoints[i % len(endpoints)] for i in range(TOTAL_REQUESTS)]

  start_total = time.perf_counter()
  results = []

  with concurrent.futures.ThreadPoolExecutor(max_workers=NUM_WORKERS) as executor:
    futures = [executor.submit(send_request, ep) for ep in request_queue]
    for future in concurrent.futures.as_completed(futures):
      results.append(future.result())

  total_duration_sec = time.perf_counter() - start_total
  latencies = sorted([r[0] for r in results])
  successes = sum(1 for r in results if r[1])
  failures = len(results) - successes

  rps = len(results) / total_duration_sec
  p50 = calculate_percentile(latencies, 50)
  p95 = calculate_percentile(latencies, 95)
  p99 = calculate_percentile(latencies, 99)
  avg_latency = sum(latencies) / len(latencies) if latencies else 0

  print("\n📊 BENCHMARK RESULTS SUMMARY:")
  print(f"  • Total Requests Completed : {len(results)}")
  print(f"  • Successful (200 OK)     : {successes} ({successes/len(results)*100:.1f}%)")
  print(f"  • Failed                  : {failures}")
  print(f"  • Total Elapsed Time       : {total_duration_sec:.2f} seconds")
  print(f"  • Throughput (RPS)         : {rps:.2f} req/sec")
  print(f"  • Average Latency          : {avg_latency:.2f} ms")
  print(f"  • p50 Latency (Median)     : {p50:.2f} ms")
  print(f"  • p95 Latency              : {p95:.2f} ms")
  print(f"  • p99 Latency              : {p99:.2f} ms")
  print("=========================================================================\n")

  if failures > 0 or rps < 10:
    print("❌ Performance Benchmark FAILED!")
    sys.exit(1)
  else:
    print("✅ Performance Benchmark PASSED!")
    sys.exit(0)


if __name__ == "__main__":
  run_benchmark()
