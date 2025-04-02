const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

let numberWindow = [];

// Authentication credentials
const AUTH = {
    email: "vsonaljaiswal@gmail.com",
    name: "Sonal Jaiswal",
    rollNo: "22051285",
    accessCode: "nwpwrZ",
    clientID: "028cbe13-01eb-4620-b6eb-b7c94f085226",
    clientSecret: "MFTfgYuQWtasrGYu"
};

// Authentication token
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjAyOTgwLCJpYXQiOjE3NDM2MDI2ODAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjAyOGNiZTEzLTAxZWItNDYyMC1iNmViLWI3Yzk0ZjA4NTIyNiIsInN1YiI6InZzb25hbGphaXN3YWxAZ21haWwuY29tIn0sImVtYWlsIjoidnNvbmFsamFpc3dhbEBnbWFpbC5jb20iLCJuYW1lIjoic29uYWwgamFpc3dhbCIsInJvbGxObyI6IjIyMDUxMjg1IiwiYWNjZXNzQ29kZSI6Im53cHdyWiIsImNsaWVudElEIjoiMDI4Y2JlMTMtMDFlYi00NjIwLWI2ZWItYjdjOTRmMDg1MjI2IiwiY2xpZW50U2VjcmV0IjoiTUZUZmdZdVFXdGFzckdZdSJ9.D36O_vCosW83nC7zK8LHji-8E5_DgFRAEsknH7187RQ';

// Fetch numbers from third-party API
const fetchNumbers = async (numberid) => {
    const apiUrls = {
        p: 'http://20.244.56.144/evaluation-service/primes',
        f: 'http://20.244.56.144/evaluation-service/fibo',
        e: 'http://20.244.56.144/evaluation-service/even',
        r: 'http://20.244.56.144/evaluation-service/rand'
    };
    
    if (!apiUrls[numberid]) return [];
    console.log(AUTH_TOKEN);
    try {
        console.log(`Fetching numbers from ${apiUrls[numberid]}`);
        const response = await axios.get(apiUrls[numberid], {
            // timeout: 5000,
            headers: {
                // 'accept': 'application/json',
                // 'content-type': 'application/json',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                // 'email': AUTH.email,
                // 'roll-number': AUTH.rollNo,
                // 'access-code': AUTH.accessCode,
                // 'client-id': AUTH.clientID,
                // 'client-secret': AUTH.clientSecret
            }
        });
        console.log('API Response:', response.data);
        
        if (!response.data || !response.data.numbers) {
            console.error('Invalid API response format:', response.data);
            return [];
        }
        
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            headers: error.response?.headers
        });
        return [];
    }
};

// Endpoint to handle number requests
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    if (!['p', 'f', 'e', 'r'].includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }
    
    try {
        const windowPrevState = [...numberWindow];
        const numbers = await fetchNumbers(numberid);
        console.log('Fetched numbers:', numbers);
        
        // Update window state with new numbers
        for (const num of numbers) {
            if (!numberWindow.includes(num)) {
                if (numberWindow.length >= WINDOW_SIZE) {
                    numberWindow.shift(); // Remove oldest number
                }
                numberWindow.push(num);
            }
        }
        
        // Calculate average of current window
        const average = numberWindow.length > 0 ? 
            numberWindow.reduce((acc, num) => acc + num, 0) / numberWindow.length : 0;
        
        const response = {
            windowPrevState: windowPrevState,
            windowCurrState: [...numberWindow],
            numbers: numbers,
            avg: parseFloat(average.toFixed(2))
        };
        
        console.log('Sending response:', response);
        res.json(response);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});