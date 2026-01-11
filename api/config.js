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
                        request_id: "{{Event.request_id}}",
                        contact_key: "{{Event.contact_key}}",
                        phone_number: "{{Event.phone_number}}",
                        status: "{{Event.status}}",
                        created_at: "{{Event.created_at}}",
                        updated_at: "{{Event.updated_at}}"
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