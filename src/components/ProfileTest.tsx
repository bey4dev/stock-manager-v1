import { useState } from 'react';
import googleSheetsService from '../services/GoogleSheetsService';

export default function ProfileTest() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testGetProfile = async () => {
    setLoading(true);
    try {
      console.log('🧪 [PROFILE TEST] Starting profile test...');
      
      // First check if GAPI is loaded
      if (!window.gapi) {
        console.error('🧪 [PROFILE TEST] GAPI not loaded');
        setProfile({ error: 'GAPI not loaded' });
        return;
      }

      // Check for token (GIS approach)
      const token = window.gapi.client?.getToken();
      if (!token || !token.access_token) {
        console.error('🧪 [PROFILE TEST] No access token');
        setProfile({ error: 'No access token available' });
        return;
      }

      console.log('🧪 [PROFILE TEST] Access token available');

      // Test 1: Direct API call to OAuth2 userinfo
      let oauth2Profile = null;
      try {
        console.log('🧪 [PROFILE TEST] Testing OAuth2 userinfo...');
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${token.access_token}`
          }
        });
        
        if (response.ok) {
          oauth2Profile = await response.json();
          console.log('🧪 [PROFILE TEST] OAuth2 userinfo result:', oauth2Profile);
        }
      } catch (error) {
        console.error('🧪 [PROFILE TEST] OAuth2 userinfo error:', error);
      }

      // Test 2: People API
      let peopleProfile = null;
      try {
        console.log('🧪 [PROFILE TEST] Testing People API...');
        
        // Load People API if not already loaded
        if (!window.gapi.client.people) {
          await window.gapi.client.load('people', 'v1');
        }

        const response = await window.gapi.client.people.people.get({
          resourceName: 'people/me',
          personFields: 'names,emailAddresses,photos'
        });

        const person = response.result;
        peopleProfile = {
          name: person.names?.[0]?.displayName,
          email: person.emailAddresses?.[0]?.value,
          picture: person.photos?.[0]?.url
        };
        console.log('🧪 [PROFILE TEST] People API result:', peopleProfile);
      } catch (error) {
        console.error('🧪 [PROFILE TEST] People API error:', error);
      }

      // Test 3: Through service
      const serviceProfile = await googleSheetsService.getUserProfile();
      console.log('🧪 [PROFILE TEST] Service profile:', serviceProfile);

      setProfile({
        oauth2: oauth2Profile,
        people: peopleProfile,
        service: serviceProfile,
        hasToken: !!token,
        tokenInfo: token ? { scope: token.scope, expires_at: token.expires_at } : null
      });
    } catch (error) {
      console.error('🧪 [PROFILE TEST] Error:', error);
      setProfile({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Google Profile Test</h2>
      
      <button
        onClick={testGetProfile}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Get Profile'}
      </button>

      {profile && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          {profile.oauth2 && (
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold mb-2 text-green-800">OAuth2 Userinfo Result:</h3>
              <p><strong>Name:</strong> {profile.oauth2.name}</p>
              <p><strong>Email:</strong> {profile.oauth2.email}</p>
              <p><strong>Picture:</strong> {profile.oauth2.picture ? 'Available' : 'None'}</p>
            </div>
          )}

          {profile.people && (
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-semibold mb-2 text-purple-800">People API Result:</h3>
              <p><strong>Name:</strong> {profile.people.name}</p>
              <p><strong>Email:</strong> {profile.people.email}</p>
              <p><strong>Picture:</strong> {profile.people.picture ? 'Available' : 'None'}</p>
            </div>
          )}

          {profile.service && (
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold mb-2 text-blue-800">Service Method Result:</h3>
              <p><strong>Name:</strong> {profile.service.name}</p>
              <p><strong>Email:</strong> {profile.service.email}</p>
            </div>
          )}

          {profile.tokenInfo && (
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold mb-2 text-yellow-800">Token Info:</h3>
              <p><strong>Has Token:</strong> {profile.hasToken ? 'Yes' : 'No'}</p>
              <p><strong>Scope:</strong> {profile.tokenInfo.scope}</p>
            </div>
          )}

          {profile.error && (
            <div className="bg-red-50 p-4 rounded">
              <h3 className="font-semibold mb-2 text-red-800">Error:</h3>
              <p>{profile.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
