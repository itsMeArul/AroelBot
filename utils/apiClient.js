require('dotenv').config();
const fetch = require('node-fetch');

class ApiClient {
    constructor() {
        this.apiKey = process.env.API_KEY;
        this.baseUrl = 'https://pandadevelopment.net/api';
    }

    async getUser(userId) {
        try {
            const url = `${this.baseUrl}/key/fetch?apiKey=${this.apiKey}&fetch=user.id%20${userId}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Transform API response to match expected format
            if (data && data.status === 'success') {
                return {
                    userId: userId,
                    key: data.data.key || null,
                    exists: true
                };
            }

            return {
                userId: userId,
                key: null,
                exists: false
            };
        } catch (error) {
            console.error('Error fetching user from API:', error);
            return {
                userId: userId,
                key: null,
                exists: false
            };
        }
    }

    async addUser(userId, key) {
        try {
            // Note: This assumes the API has an endpoint to create/update user records
            // If not available, you may need to implement this functionality
            const url = `${this.baseUrl}/user/create?apiKey=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    key: key
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.status === 'success';
        } catch (error) {
            console.error('Error adding user to API:', error);
            return false;
        }
    }

    async updateUserKey(userId, newKey) {
        try {
            // Note: This assumes the API has an endpoint to update user keys
            // If not available, you may need to implement this functionality
            const url = `${this.baseUrl}/user/update?apiKey=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    key: newKey
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.status === 'success';
        } catch (error) {
            console.error('Error updating user key in API:', error);
            return false;
        }
    }

    async deleteUser(userId) {
        try {
            // Note: This assumes the API has an endpoint to delete users
            // If not available, you may need to implement this functionality
            const url = `${this.baseUrl}/user/delete?apiKey=${this.apiKey}&userId=${userId}`;
            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.status === 'success';
        } catch (error) {
            console.error('Error deleting user from API:', error);
            return false;
        }
    }

    async generateUserKey() {
        try {
            const currentDate = new Date();
            const nextYear = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
            const expireDate = nextYear.toISOString().split('T')[0];

            const url = `https://pandadevelopment.net/api/generate-key/get?apiKey=${this.apiKey}&expire=${expireDate}&note=Ir-samaTestKey&count=1&isPremium=true&expiresByDaysKey=true&daysKey=30`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data && data.status === 'success') {
                return {
                    success: true,
                    keys: data.data.keys || [],
                    message: 'Key generated successfully'
                };
            }

            return {
                success: false,
                keys: [],
                message: 'Failed to generate key'
            };
        } catch (error) {
            console.error('Error generating user key:', error);
            return {
                success: false,
                keys: [],
                message: error.message
            };
        }
    }

    async resetHWID(key) {
        try {
            const url = `${this.baseUrl}/reset-hwid?service=aroelhub&key=${key}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HWID reset failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error resetting HWID:', error);
            throw error;
        }
    }

    async fetchKeyInfo(key) {
        try {
            const url = `${this.baseUrl}/key/fetch?apiKey=${this.apiKey}&fetch=${key}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Key fetch failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching key info:', error);
            throw error;
        }
    }

    async fetchGeneratedKeyInfo(key) {
        try {
            const url = `${this.baseUrl}/generated-key/fetch?apiKey=${this.apiKey}&fetch=${key}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Generated key fetch failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching generated key info:', error);
            throw error;
        }
    }

    async fetchKeyWithFallback(keyOrUserId) {
        try {
            console.log('[DEBUG] fetchKeyWithFallback called with:', keyOrUserId);

            // 1. Pertama coba fetch active key (dengan HWID)
            const activeKeyUrl = `${this.baseUrl}/key/fetch?apiKey=${this.apiKey}&fetch=${keyOrUserId}`;
            console.log('[DEBUG] Trying active key URL:', activeKeyUrl);

            const activeKeyResponse = await fetch(activeKeyUrl);
            console.log('[DEBUG] Active key response status:', activeKeyResponse.status);
            console.log('[DEBUG] Active key response ok:', activeKeyResponse.ok);

            let activeKeyData = null;
            let activeKeyFound = false;

            // 2. Cek jika active key response valid
            if (activeKeyResponse.ok) {
                activeKeyData = await activeKeyResponse.json();
                console.log('[DEBUG] Active key response data:', JSON.stringify(activeKeyData, null, 2));

                if (activeKeyData && activeKeyData.key) {
                    console.log('[DEBUG] Active key found and has HWID');
                    return {
                        success: true,
                        endpoint: 'active',
                        data: activeKeyData,
                        keyInfo: activeKeyData.key
                    };
                } else if (activeKeyData && activeKeyData.data && activeKeyData.data.key) {
                    console.log('[DEBUG] Active key found (nested data structure)');
                    return {
                        success: true,
                        endpoint: 'active',
                        data: activeKeyData,
                        keyInfo: activeKeyData.data.key
                    };
                } else {
                    console.log('[DEBUG] Active key response but no valid key found');
                }
            } else {
                console.log('[DEBUG] Active key response not ok, status:', activeKeyResponse.status);
                // Coba baca error body untuk debugging
                try {
                    const errorText = await activeKeyResponse.text();
                    console.log('[DEBUG] Active key error response:', errorText);
                } catch (e) {
                    console.log('[DEBUG] Could not read active key error response');
                }
            }

            // 3. Jika active key tidak ditemukan (404/error/empty), paksa coba generated key
            console.log('[DEBUG] Active key not found or no HWID, trying generated key...');

            const generatedKeyUrl = `${this.baseUrl}/generated-key/fetch?apiKey=${this.apiKey}&fetch=${keyOrUserId}`;
            console.log('[DEBUG] Trying generated key URL:', generatedKeyUrl);

            const generatedKeyResponse = await fetch(generatedKeyUrl);
            console.log('[DEBUG] Generated key response status:', generatedKeyResponse.status);
            console.log('[DEBUG] Generated key response ok:', generatedKeyResponse.ok);

            if (!generatedKeyResponse.ok) {
                console.log('[DEBUG] Generated key also not found');
                // Coba baca error body untuk debugging
                try {
                    const errorText = await generatedKeyResponse.text();
                    console.log('[DEBUG] Generated key error response:', errorText);
                } catch (e) {
                    console.log('[DEBUG] Could not read generated key error response');
                }

                return {
                    success: false,
                    error: "No key found (both active and generated)",
                    data: null,
                    keyInfo: null
                };
            }

            const generatedKeyData = await generatedKeyResponse.json();
            console.log('[DEBUG] Generated key response data:', JSON.stringify(generatedKeyData, null, 2));

            // 4. Return generated key jika ditemukan
            if (generatedKeyData && generatedKeyData.generatedKey) {
                console.log('[DEBUG] Generated key found (no HWID assigned)');
                return {
                    success: true,
                    endpoint: 'generated',
                    data: generatedKeyData,
                    keyInfo: generatedKeyData.generatedKey
                };
            } else if (generatedKeyData && generatedKeyData.data && generatedKeyData.data.generatedKey) {
                console.log('[DEBUG] Generated key found (nested data structure)');
                return {
                    success: true,
                    endpoint: 'generated',
                    data: generatedKeyData,
                    keyInfo: generatedKeyData.data.generatedKey
                };
            } else {
                console.log('[DEBUG] Generated key response but no valid key found');
            }

            // 5. Jika tidak ada key yang ditemukan
            console.log('[DEBUG] No key found at all');
            return {
                success: false,
                error: "No key found (both active and generated)",
                data: null,
                keyInfo: null
            };

        } catch (error) {
            console.error('[DEBUG] Error in fetchKeyWithFallback:', error);
            return {
                success: false,
                error: error.message,
                data: null,
                keyInfo: null
            };
        }
    }

    async fetchExecutionCount() {
        try {
            const url = `https://pandadevelopment.net/api/execution-count?apiKey=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Execution count fetch failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.executionCount || 0;
        } catch (error) {
            console.error('Error fetching execution count:', error);
            return 0;
        }
    }
}

module.exports = new ApiClient();