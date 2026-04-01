import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import path from 'path';

export async function getVertexGoogleAuthOptions() {
  const projectId = process.env.GCP_PROJECT_ID || "ozigi-489021";

  // Check for Vercel environment (production, preview, or v0 sandbox)
  const isVercelEnv = process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL;
  
  if (isVercelEnv) {
    const projectNumber = process.env.GCP_PROJECT_NUMBER?.trim();
    const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID?.trim();
    const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID?.trim();
    const saEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL?.trim();

    const audience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;

    const authClient = ExternalAccountClient.fromJSON({
      type: 'external_account',
      audience,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      token_url: 'https://sts.googleapis.com/v1/token',
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${saEmail}:generateAccessToken`,
      subject_token_supplier: {
        getSubjectToken: async () => await getVercelOidcToken(),
      },
    });

    // authClient is defined; we'll use it directly
    return { authClient, projectId };
  } else {
    return {
      keyFilename: path.join(process.cwd(), "gcp-service-account.json"),
      projectId
    };
  }
}
