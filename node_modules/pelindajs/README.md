# PelindaJS

A JavaScript client library for interacting with the Panda Development API service. PelindaJS provides a simple and efficient way to manage license keys, validate users, and track executions for your software applications.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Initialization](#initialization)
  - [Get Execution Count](#get-execution-count)
  - [Increment Execution Count](#increment-execution-count)
  - [Generate Key](#generate-key)
  - [Delete Key](#delete-key)
  - [Check Identifier](#check-identifier)
  - [Expend Key Expiration](#expend-key-expiration)
  - [Fetch Key](#fetch-key)
  - [Delete Keyless](#delete-keyless)
  - [Fetch Generated Key](#fetch-generated-key)
  - [Validate Key](#validate-key)
- [Examples](#examples)
- [Error Handling](#error-handling)
- [License](#license)

## Description

PelindaJS is a lightweight wrapper for the Panda Development API service that helps you integrate license management functionality into your JavaScript applications. It provides methods for generating license keys, validating users, managing key lifecycles, and tracking usage.

## Installation

```bash
npm install pelindajs
```

## Usage

First, import the PelindaJS class and create a new instance with your API key:

```javascript
import { PelindaJS } from "pelindajs";

async function main() {
  try {
    const pelinda = await PelindaJS.new("your-api-key-here");
    // Now you can use the pelinda instance
  } catch (error) {
    console.error("Failed to initialize PelindaJS:", error.message);
  }
}

main();
```

## API Reference

### Initialization

```javascript
const pelinda = await PelindaJS.new(apiKey);
```

Creates a new PelindaJS instance with the provided API key. This method validates the API key before creating the instance.

**Example:**

```javascript
import { PelindaJS } from "pelindajs";

async function init() {
  try {
    const pelinda = await PelindaJS.new(
      "your-api-key"
    );
    console.log("PelindaJS initialized successfully");
  } catch (error) {
    console.error("Failed to initialize:", error.message);
  }
}

init();
```

### Get Execution Count

```javascript
const result = await pelinda.getExecutionCount();
```

Retrieves the current execution count associated with your API key.

**Example:**

```javascript
async function checkExecutionCount() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.getExecutionCount();

  if (result.success) {
    console.log(`Current execution count: ${result.executionCount}`);
  } else {
    console.error(`Failed to get execution count: ${result.message}`);
  }
}
```

### Increment Execution Count

```javascript
const result = await pelinda.incrementExecutionCount();
```

Increments the execution count associated with your API key.

**Example:**

```javascript
async function incrementCount() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.incrementExecutionCount();

  if (result.success) {
    console.log(result.message);
  } else {
    console.error(`Failed to increment execution count: ${result.message}`);
  }
}
```

### Generate Key

```javascript
const result = await pelinda.generateKey({
  expire: "YYYY-MM-DD",
  note: "Optional note",
  count: 1,
  isPremium: false,
  expiresByDaysKey: false,
  daysKey: 1,
});
```

Generates new license keys with the specified parameters.

**Parameters:**

- `expire` (required): Expiration date in YYYY-MM-DD format
- `note` (optional): A note to attach to the key
- `count` (required): Number of keys to generate
- `isPremium` (required): Whether the key is for premium features
- `expiresByDaysKey` (optional): Whether the key expires by days
- `daysKeys` (optional, required if expiresByDaysKey is true): Number of days before expiration

**Example:**

```javascript
async function generateLicenseKeys() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.generateKey({
    expire: "2025-12-31",
    note: "Test license keys",
    count: 5,
    isPremium: true,
    expiresByDaysKey: true,
    daysKeys: 30,
  });

  if (result.success) {
    console.log(`Generated keys: ${result.generatedKeys}`);
  } else {
    console.error(`Failed to generate keys: ${result.message}`);
  }
}
```

### Delete Key

```javascript
const result = await pelinda.deleteKey({
  keyValue: "key-to-delete",
});
```

Deletes an activated key from the system.

**Example:**

```javascript
async function deleteUserKey() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.deleteKey({
    keyValue:
      "user-key",
  });

  if (result.success) {
    console.log(`Key deleted: ${result.deletedKey}`);
  } else {
    console.error(`Failed to delete key: ${result.message}`);
  }
}
```

### Check Identifier

```javascript
const result = await pelinda.checkIdentifier(identifier);
```

Checks if an identifier exists in the system and returns service information.

**Example:**

```javascript
async function checkUserIdentifier() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.checkIdentifier("identifier-123");

  if (result.success) {
    console.log(`Identifier status: ${result.message}`);
    console.log(`Service: ${result.service}`);
  } else {
    console.error(`Failed to check identifier: ${result.message}`);
  }
}
```

### Expend Key Expiration

```javascript
const result = await pelinda.expendKeyExpiration({
  keyValue: "key-to-extend",
  days: 30,
});
```

Extends the expiration date of a key by a specified number of days.

**Example:**

```javascript
async function extendKeyValidity() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.expendKeyExpiration({
    keyValue:
      "user-key",
    days: 60,
  });

  if (result.success) {
    console.log(`Key extended: ${result.message}`);
    console.log(`Updated key info:`, result.key);
  } else {
    console.error(`Failed to extend key: ${result.message}`);
  }
}
```

### Fetch Key

```javascript
const result = await pelinda.fetchKey(searchTerm);
```

Searches for and retrieves information about a specific key.

**Example:**

```javascript
async function lookupKey() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.fetchKey(
    "user-key"
  );

  if (result.success) {
    console.log(`Key details:`, result.key);
  } else {
    console.error(`Failed to fetch key: ${result.message}`);
  }
}
```

### Delete Keyless

```javascript
const result = await pelinda.deleteKeyless({
  hwid: "hardware-id",
});
```

Deletes a keyless authentication entry by hardware ID.

**Example:**

```javascript
async function removeKeylessAuth() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.deleteKeyless({
    hwid: "hwid",
  });

  if (result.success) {
    console.log(result.message);
  } else {
    console.error(`Failed to delete keyless entry: ${result.message}`);
  }
}
```

### Fetch Generated Key

```javascript
const result = await pelinda.fetchGeneratedKey(searchTerm);
```

Searches for and retrieves information about a specific generated key.

**Example:**

```javascript
async function findGeneratedKey() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.fetchGeneratedKey(
    "your-key"
  );

  if (result.success) {
    console.log(`Generated key details:`, result.generatedKey);
  } else {
    console.error(`Failed to fetch generated key: ${result.message}`);
  }
}
```

### Validate Key

```javascript
const result = await pelinda.validateKey(
  {
    keyValue: "key-to-validate",
    hwid: "hardware-id", // Optional, will use system HWID if not provided
    service: "service-name",
  },
  keylessEnabled
); // keylessEnabled is optional (default: false)
```

Validates a license key against the service with the hardware ID.

**Example:**

```javascript
async function validateUserKey() {
  const pelinda = await PelindaJS.new("your-api-key");
  const result = await pelinda.validateKey({
    service: "your-service-here",
    keyValue:
      "user-key",
    hwid: "user-hwid",
  });

  if (result.success) {
    console.log(`Validation result:`, result.result);
    console.log(`Authentication status: ${result.result.V2_Authentication}`);
  } else {
    console.error(`Failed to validate key: ${result.message}`);
  }
}
```

## Examples

### Complete Example - Key Management Workflow

```javascript
import { PelindaJS } from "pelindajs";

async function licenseManagementDemo() {
  try {
    // Initialize PelindaJS
    const pelinda = await PelindaJS.new("YOUR_API_KEY_HERE");

    // Generate new license keys
    const genResult = await pelinda.generateKey({
      expire: "2025-06-30",
      note: "Demo keys",
      count: 2,
      isPremium: true,
    });

    if (genResult.success) {
      console.log(`Generated keys: ${genResult.generatedKeys[0], genResult.generatedKeys[1]}`);

      // Validate one of the generated keys
      const keyToValidate = genResult.generatedKeys[0];
      const validateResult = await pelinda.validateKey({
        keyValue: keyToValidate.value,
        service: "YOUR_SERVICE_NAME",
      });

      if (validateResult.success) {
        console.log(`Key validation successful`);

        // Extend the key's expiration
        const extendResult = await pelinda.expendKeyExpiration({
          keyValue: keyToValidate.value,
          days: 30,
        });

        if (extendResult.success) {
          console.log(`Key expiration extended by 30 days`);

          // Fetch the updated key information
          const fetchResult = await pelinda.fetchKey(keyToValidate.value);
          if (fetchResult.success) {
            console.log(`Updated key information:`, fetchResult.result.key);
          }
        }
      }
    }

    // Check the execution count
    const countResult = await pelinda.getExecutionCount();
    if (countResult.success) {
      console.log(`Current execution count: ${countResult.executionCount}`);

      // Increment the execution count
      const incrementResult = await pelinda.incrementExecutionCount();
      if (incrementResult.success) {
        console.log(incrementResult.message);
      }
    }
  } catch (error) {
    console.error(`Demo failed: ${error.message}`);
  }
}

licenseManagementDemo();
```

## Error Handling

All methods in PelindaJS return a standard response object with the following structure:

```javascript
{
  success: boolean,
  message: string,
  // Additional properties depending on the method
}
```

When a request fails, the `success` property will be `false` and the `message` property will contain details about the error.

## License

[MIT License](LICENSE)

---

Created and maintained by Panda Development Team.
