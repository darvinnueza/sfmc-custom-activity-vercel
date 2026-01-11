module.exports = (req, res) => {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const baseUrl = `${proto}://${host}`;

  return res.status(200).json({
    workflowApiVersion: "1.1",
    metaData: {
      icon: "https://www.svgrepo.com/show/354243/salesforce.svg",
      category: "message"
    },
    type: "REST",
    lang: {
      "en-US": {
        name: "VoiceBot Demo Activity",
        description: "Demo REST activity (Workflow API v1.1)"
      }
    },
    arguments: {
      execute: {
        inArguments: [
          { request_id: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}" },
          { contact_key: "{{Contact.Key}}" },
          { phone_number: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}" },
          { status: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.status}}" }
        ],
        outArguments: [],
        url: `${baseUrl}/api/execute`,
        timeout: 10000
      }
    },
    configurationArguments: {
      save: { url: `${baseUrl}/api/save` },
      publish: { url: `${baseUrl}/api/publish` },
      validate: { url: `${baseUrl}/api/validate` },
      stop: { url: `${baseUrl}/api/stop` }
    },
    userInterfaces: {
      configurationSupport: `${baseUrl}/index.html`,
      runningSupport: `${baseUrl}/index.html`
    }
  });
};