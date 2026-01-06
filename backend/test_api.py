import urllib.request
import urllib.parse
import json

URL = "http://127.0.0.1:8000/api/users/login/"

def test_login(username, password):
    print(f"Attempting login for: {username}")
    data = json.dumps({"username": username, "password": password}).encode('utf-8')
    req = urllib.request.Request(URL, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.getcode()}")
            print(f"Response: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Response: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_login("bitu", "Admin@123")
    test_login("sahil@email.com", "Admin@123")
