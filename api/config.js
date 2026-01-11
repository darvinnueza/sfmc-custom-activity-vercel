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
        description: "Demo Custom Activity (REST) on Vercel"
      }
    },

    arguments: {
      execute: {
        inArguments: [
          { request_id: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}" },
          { contact_key: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.contact_key}}" },
          { phone_number: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}" },
          { status: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.status}}" },
          { created_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.created_at}}" },
          { updated_at: "{{Event.VOICEBOT_DEMO_CAMPAIGN_1.updated_at}}" }
        ],
        outArguments: [],
        url: `${baseUrl}/api/execute`,
        timeout: 10000,
        retryCount: 0,
        retryDelay: 0,
        concurrentRequests: 1
      }
    },

    configurationArguments: {
      save: { url: `${baseUrl}/api/publish` },   // puedes apuntar save a publish por ahora
      publish: { url: `${baseUrl}/api/publish` },
      validate: { url: `${baseUrl}/api/validate` },
      stop: { url: `${baseUrl}/api/stop` }
    },

    userInterfaces: {
      configModal: {
        url: `${baseUrl}/index.html`,
        height: 260,
        width: 600,
        fullscreen: false
      }
    }
  });
};