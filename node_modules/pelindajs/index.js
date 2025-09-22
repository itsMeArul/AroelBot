import { execSync } from "child_process";

export class PelindaJS {
  #baseUrl = "https://pandadevelopment.net/api";
  apiKey;

  async #missingField(field) {
    return { success: false, message: `Missing '${field}' field.` };
  }
  async #request(endpoint, options = {}, noBase = false) {
    let url;
    if (noBase === false) {
      url = this.#baseUrl + "/" + endpoint;
    } else {
      url = endpoint;
    }
    try {
      const res = await fetch(url, {
        method: options.method !== undefined ? options.method : "GET",
        ...options,
        headers: {
          Host: "pandadevelopment.net",
          Accept: "*/*",
          "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
          "Content-Type": "application/json",
          "Alt-Used": "pandadevelopment.net",
          ...options.headers,
        },
      });
      return res;
    } catch (error) {
      throw new Error(`Request to ${endpoint} failed: ${error.message}`);
    }
  }

  async #isCorrectApiKey(apiKey) {
    try {
      const res = await this.#request(`execution-count?apiKey=${apiKey}`);
      return res.ok;
    } catch {
      return false;
    }
  }

  static async new(apiKey) {
    const instance = new PelindaJS();
    if (await instance.#isCorrectApiKey(apiKey)) {
      instance.apiKey = apiKey;
      return instance;
    } else {
      throw new Error("Invalid API key provided.");
    }
  }

  async getExecutionCount() {
    try {
      const res = await this.#request(`execution-count?apiKey=${this.apiKey}`);

      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${`execution-count?apiKey=${this.apiKey}`}, Server returned ${
            res.status
          }: ${res.statusText}`,
        };
      }

      const output = await res.json();

      if (output.executionCount !== undefined) {
        return {
          success: true,
          message: "Execution count fetched successfully ✅",
          executionCount: output.executionCount,
        };
      } else {
        return {
          success: false,
          message: "Missing execution count in server response",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async incrementExecutionCount() {
    try {
      const res = await this.#request(
        `push-execution-count?apiKey=${this.apiKey}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${`push-execution-count?apiKey=${this.apiKey}`},Server returned ${
            res.status
          }: ${res.statusText}`,
        };
      }

      const output = await res.json();

      if (output.success == true && output.message !== undefined) {
        return {
          success: true,
          message: output.message,
        };
      } else {
        return {
          success: false,
          message: "Missing message in server response or request went wrong",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async generateKey(
    body /*expire, note="", count=1, isPremium=false, expiresByDaysKey=false, daysKey=1*/
  ) {
    if (body.apiKey !== undefined) {
      if (body.apiKey !== this.apiKey) {
        return {
          success: false,
          message:
            "Incorrect api key, ensure it matches with the one you used to create the instance.",
        };
      }
    } else {
      body.apiKey = this.apiKey;
    }

    if (body.expire !== undefined) {
      if (new Date(body.expire).toISOString().slice(0, 10) === body.expire) {
        if (
          !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(body.expire)
        ) {
          return {
            success: false,
            message: "Invalid 'expire' format. Expected 'YYYY-MM-DD'",
          };
        }
      } else {
        return {
          success: false,
          message: "Invalid 'expire' date. The date does not exist.",
        };
      }
    } else {
      return this.#missingField("expire");
    }

    if (body.count === undefined) {
      return this.#missingField("count");
    }

    if (body.isPremium === undefined) {
      return this.#missingField("isPremium");
    } else {
      if (typeof (body.isPremium === "boolean")) {
        body.isPremium = new Boolean(body.isPremium).toString();
      }
    }

    if (body.expiresByDaysKey !== undefined && body.expiresByDaysKey === true) {
      if (body.daysKeys === undefined) {
        return this.#missingField("daysKeys");
      }
    }

    try {
      const url = "generate-key/post";
      const res = await this.#request("generate-key/post", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${url}, Server returned ${res.status}: ${res.statusText}`,
        };
      }
      const output = await res.json();
      if (output.message !== undefined && output.generatedKeys !== undefined) {
        return {
          success: true,
          message: output.message,
          generatedKeys: output.generatedKeys,
        };
      } else {
        return {
          success: false,
          message:
            "Missing message or generatedKeys in server response or request went wrong",
        };
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  // This only works on ACTIVATED KEYS
  async deleteKey(
    body /*expire, note="", count=1, isPremium=false, expiresByDaysKey=false, daysKey=1*/
  ) {
    if (body.apiKey !== undefined) {
      if (body.apiKey !== this.apiKey) {
        return {
          success: false,
          message:
            "Incorrect api key, ensure it matches with the one you used to create the instance.",
        };
      }
    } else {
      body.apiKey = this.apiKey;
    }

    if (body.keyValue === undefined) {
      return this.#missingField("keyValue");
    }
    try {
      const url = "key/delete";
      const res = await this.#request(url, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${url}, Server returned ${res.status}: ${res.statusText}`,
        };
      }
      const output = await res.json();
      if (output.message !== undefined) {
        return {
          success: true,
          message: output.message,
          deletedKey: body.keyValue,
        };
      } else {
        return {
          success: false,
          message: "Missing message in server response or request went wrong",
        };
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async checkIdentifier(identifier) {
    if (identifier === undefined) {
      return this.#missingField("identifier");
    }

    try {
      const url = `identifier-check?apiKey=${this.apiKey}&identifier=${identifier}`;
      const res = await this.#request(url);
      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${url}, Server returned ${res.status}: ${res.statusText}`,
        };
      }

      const output = await res.json();
      if (output.message !== undefined && output.service !== undefined) {
        return {
          success: true,
          message: output.message,
          service: output.service,
        };
      } else {
        return {
          success: false,
          message:
            "Missing message/service in server response or request went wrong",
        };
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async expendKeyExpiration(body) {
    if (body.days === undefined) {
      return this.#missingField("days");
    }

    if (body.keyValue === undefined) {
      return this.#missingField("keyValue");
    }
    try {
      const url = `key/expand-expiration?apiKey=${this.apiKey}&keyValue=${body.keyValue}&days=${body.days}`;
      const res = await this.#request(url, { method: "POST" });
      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${url}, Server returned ${res.status}: ${res.statusText}`,
        };
      }

      const output = await res.json();
      if (output.message !== undefined && output.key !== undefined) {
        return {
          success: true,
          message: output.message,
          key: output.key,
        };
      } else {
        return {
          success: false,
          message:
            "Missing message/key in server response or request went wrong",
        };
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async fetchKey(searchTerm) {
    if (searchTerm === undefined) {
      return this.#missingField("searchTerm");
    }

    try {
      const url = `key/fetch?apiKey=${this.apiKey}&fetch=${searchTerm}`;
      const res = await this.#request(url);
      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${url}, Server returned ${res.status}: ${res.statusText}`,
        };
      }

      const output = await res.json();
      if (output.key !== undefined) {
        return {
          success: true, 
          result: output
        };
      } else {
        return {
          success: false,
          message: "Missing key in server response or request went wrong",
        };
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async deleteKeyless(body) {
    if (body.apiKey !== undefined) {
      if (body.apiKey !== this.apiKey) {
        return {
          success: false,
          message:
            "Incorrect api key, ensure it matches with the one you used to create the instance.",
        };
      }
    } else {
      body.apiKey = this.apiKey;
    }

    if (body.hwid === undefined) {
      return this.#missingField("hwid");
    }

    try {
      const url = `keyless/delete`;
      const res = await this.#request(url, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${url}, Server returned ${res.status}: ${res.statusText}`,
        };
      }

      const output = await res.json();
      if (output.message !== undefined) {
        return {
          success: true,
          message: output.message,
        };
      } else {
        return {
          success: false,
          message: "Missing message in server response or request went wrong",
        };
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async fetchGeneratedKey(searchTerm) {
    if (searchTerm === undefined) {
      return this.#missingField("searchTerm");
    }

    try {
      const url = `generated-key/fetch?apiKey=${this.apiKey}&fetch=${searchTerm}`;
      const res = await this.#request(url);
      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${url}, Server returned ${res.status}: ${res.statusText}`,
        };
      }

      const output = await res.json();
      if (output.generatedKey !== undefined) {
        return {
          success: true,
          result: output,
        };
      } else {
        return {
          success: false,
          message: "Missing key in server response or request went wrong",
        };
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }
  async validateKey(body, keylessEnabled = false) {
    if (body.keyValue === undefined && keylessEnabled === false) {
      return this.#missingField("keyValue");
    }
    if (keylessEnabled === true) {
      body.keyValue = "keyless";
    }

    if (body.hwid === undefined) {
      body.hwid = execSync("wmic csproduct get uuid")
        .toString()
        .split("\n")[1]
        .trim();
    }
    if (body.service === undefined) {
      return this.#missingField("service");
    }
    try {
      const url = `https://pandadevelopment.net/v2_validation?key=${body.keyValue}&service=${body.service}&hwid=${body.hwid}`;
      const res = await this.#request(
        url,
        {
          method: "GET",
        },
        true
      );
      if (!res.ok) {
        return {
          success: false,
          message: `Could not request ${url}, Server returned ${res.status}: ${res.statusText}`,
        };
      }

      const output = await res.json();
      if (output.V2_Authentication !== undefined) {
        return {
          success: true,
          result: output,
        };
      } else {
        return {
          success: false,
          message: "Missing V2_Authentication in output",
        };
      }
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }
}
