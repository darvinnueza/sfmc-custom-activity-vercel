module.exports = (req, res) => {
    const proto = (req.headers["x-forwarded-proto"] || "https");
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const baseUrl = `${proto}://${host}`;

    res.status(200).json({
        workflowApiVersion: "1.1",
        metaData: {
            icon: "https://www.svgrepo.com/show/354243/salesforce.svg",
            category: "message",
            isConfigured: true
        },
        type: "REST",
        lang: {
            "en-US": { name: "VoiceBot Demo Activity", description: "Demo Custom Activity (REST) on Vercel" }
        },
        arguments: {
            execute: {
                inArguments: [
                {
                    request_id: "{{Contact.Attribute.VOICEBOT_DEMO_CAMPAIGN_1.request_id}}",
                    contact_key: "{{Contact.Attribute.VOICEBOT_DEMO_CAMPAIGN_1.contact_key}}",
                    phone_number: "{{Contact.Attribute.VOICEBOT_DEMO_CAMPAIGN_1.phone_number}}",
                    status: "{{Contact.Attribute.VOICEBOT_DEMO_CAMPAIGN_1.status}}",
                    created_at: "{{Contact.Attribute.VOICEBOT_DEMO_CAMPAIGN_1.created_at}}",
                    updated_at: "{{Contact.Attribute.VOICEBOT_DEMO_CAMPAIGN_1.updated_at}}"
                }
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