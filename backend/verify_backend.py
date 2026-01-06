import urllib.request
import urllib.error
import json

url = "http://127.0.0.1:8000/api/community/posts/"

try:
    print(f"Requesting {url}...")
    with urllib.request.urlopen(url) as response:
        print(f"Status: {response.status}")
        data = json.loads(response.read().decode())
        print("Response keys:", data.keys())
        if 'results' in data:
            print(f"Results count: {len(data['results'])}")
        else:
            print("WARNING: 'results' key not found in response. Pagination might not be working.")
            print("Response preview:", str(data)[:200])

except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode())
except urllib.error.URLError as e:
    print(f"URL Error: {e.reason}")
except Exception as e:
    print(f"Error: {e}")
