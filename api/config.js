module.exports = (req, res) => {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const baseUrl = `${proto}://${host}`;

  res.status(200).json({
    workflowApiVersion: "1.1",
    type: "REST",

    metaData: {
      category: "message",
      isConfigured: true
    },

    arguments: {
      execute: {
        inArguments: [
          { request_id: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}" },
          { contact_key: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.contact_key}}" },
          { phone_number: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}" }
        ],
        url: `${baseUrl}/api/execute`,
        timeout: 10000
      }
    }
  });
};