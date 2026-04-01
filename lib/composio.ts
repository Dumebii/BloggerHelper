const COMPOSIO_API_BASE = 'https://backend.composio.dev/api/v3';
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY!;

export async function initiateGitHubConnection(userId: string, redirectUri: string) {
  const payload = {
    user_id: userId,
    auth_config: {
      id: process.env.COMPOSIO_GITHUB_AUTH_CONFIG_ID,
    },
    connection: {
      redirect_uri: redirectUri,
    },
  };
  console.log('Composio initiate payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts`, {
    method: 'POST',
    headers: {
      'x-api-key': COMPOSIO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  console.log('Composio initiate response status:', response.status);
  console.log('Composio initiate response body:', responseText);

  if (!response.ok) {
    throw new Error(`Composio API error: ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    throw new Error('Invalid JSON response from Composio');
  }

  // The v3 API returns a redirect_url field (snake_case)
  if (!data.redirect_url) {
    throw new Error('Composio response missing redirect_url');
  }
  return data.redirect_url;
}

export async function exchangeCode(code: string, state: string) {
  console.log('🔁 Exchange started with code:', code, 'state:', state);
  const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts/exchange`, {
    method: 'POST',
    headers: {
      'x-api-key': COMPOSIO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, state }),
  });
  const responseText = await response.text();
  console.log('📥 Exchange response status:', response.status);
  console.log('📥 Exchange response body:', responseText);
  if (!response.ok) {
    throw new Error(`Composio exchange error: ${responseText}`);
  }
  const data = JSON.parse(responseText);
  console.log('✅ Exchange parsed data:', data);
  return data;
}

export async function getComposioConnection(connectionId: string) {
  const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts/${connectionId}`, {
    headers: { 'x-api-key': COMPOSIO_API_KEY },
  });
  if (!response.ok) throw new Error('Connection not found');
  return response.json();
}