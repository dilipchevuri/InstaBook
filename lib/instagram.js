// Publishes one image + caption to an Instagram Business account via the
// Instagram Graph API. Requires: IG_BUSINESS_ID and IG_ACCESS_TOKEN in env.
// Docs: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/content-publishing

const GRAPH_VERSION = "v20.0";

export async function publishToInstagram({ imageUrl, caption }) {
  const igId = process.env.IG_BUSINESS_ID;
  const token = process.env.IG_ACCESS_TOKEN;

  if (!igId || !token) {
    throw new Error("Missing IG_BUSINESS_ID or IG_ACCESS_TOKEN env vars");
  }

  // Step 1: create a media container
  const createUrl = `https://graph.facebook.com/${GRAPH_VERSION}/${igId}/media`;
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: token,
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`IG media create failed: ${JSON.stringify(createData)}`);
  }

  // Step 2: publish the container
  const publishUrl = `https://graph.facebook.com/${GRAPH_VERSION}/${igId}/media_publish`;
  const publishRes = await fetch(publishUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: createData.id,
      access_token: token,
    }),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok) {
    throw new Error(`IG publish failed: ${JSON.stringify(publishData)}`);
  }

  return publishData; // { id: "<published post id>" }
}
