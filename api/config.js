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
                    { contactKey: "{{Contact.Key}}" },
                    { email: "{{Contact.Default.Email}}" }
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
            configurationSupport: `${baseUrl}/ui/config.html`,
            runningSupport: `${baseUrl}/ui/running.html`
        }
    });
};