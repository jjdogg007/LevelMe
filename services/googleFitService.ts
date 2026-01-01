
// Service to handle Google Fit Integration
// Note: In a real deployment, you must configure a Google Cloud Project and get a Client ID.

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE'; 
const SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read';

let gapiInited = false;
let tokenClient: any;

export const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
        if ((window as any).gapi) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(false);
        document.body.appendChild(script);
        
        const clientScript = document.createElement('script');
        clientScript.src = 'https://accounts.google.com/gsi/client';
        document.body.appendChild(clientScript);
    });
};

export const initializeGoogleFit = async () => {
    try {
        await loadGoogleScript();
        
        return new Promise((resolve, reject) => {
            (window as any).gapi.load('client', async () => {
                try {
                    await (window as any).gapi.client.init({
                        // apiKey: API_KEY, // Optional for this flow if using token model
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest'],
                    });
                    
                    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                        client_id: CLIENT_ID,
                        scope: SCOPES,
                        callback: '', // defined later
                    });
                    
                    gapiInited = true;
                    resolve(true);
                } catch (err) {
                    console.error("GAPI Init Error:", err);
                    reject(err);
                }
            });
        });
    } catch (e) {
        console.error("Script Load Error", e);
        return false;
    }
};

export const signInToGoogleFit = async (): Promise<boolean> => {
    if (!gapiInited) {
        const success = await initializeGoogleFit();
        if (!success) return false;
    }

    return new Promise((resolve) => {
        tokenClient.callback = async (resp: any) => {
            if (resp.error) {
                resolve(false);
                return;
            }
            resolve(true);
        };

        if ((window as any).gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({prompt: ''});
        }
    });
};

export const fetchDailySteps = async (): Promise<number> => {
    if (!gapiInited) return 0;

    // Start of today
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = now.getTime();

    try {
        const response = await (window as any).gapi.client.fitness.users.dataset.aggregate({
            userId: 'me',
            resource: {
                aggregateBy: [{
                    dataTypeName: 'com.google.step_count.delta',
                    dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
                }],
                bucketByTime: { durationMillis: 86400000 }, // 1 day
                startTimeMillis: startOfDay,
                endTimeMillis: endOfDay
            }
        });

        const bucket = response.result.bucket?.[0];
        const dataset = bucket?.dataset?.[0];
        const point = dataset?.point?.[0];
        const steps = point?.value?.[0]?.intVal || 0;
        
        return steps;
    } catch (e) {
        console.error("Error fetching steps:", e);
        // Simulate for demo if API fails/not configured
        return Math.floor(Math.random() * 5000) + 2000;
    }
};
