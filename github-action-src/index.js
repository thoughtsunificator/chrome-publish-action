import fs from 'fs'
import fetch from 'node-fetch';
import core from '@actions/core'

(async function() {

	try {

		const responseFetch = await fetch('https://www.googleapis.com/oauth2/v4/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: core.getInput("chrome-client-id"),
				refresh_token: core.getInput("chrome-refresh-token"),
				grant_type: 'refresh_token',
				client_secret: core.getInput("chrome-client-secret")
			})
		})

		const responseFetchData = await responseFetch.json()

		if(responseFetch.status !== 200) {
			if(responseFetchData.error) {
				throw new Error(responseFetchData.error_description || responseFetchData.error.message)
			} else {
				core.setFailed(responseFetchData)
				return
			}
		}

		const access_token = responseFetchData.access_token

		const readStream = fs.createReadStream(core.getInput("zip"));
		const stats = fs.statSync(core.getInput("zip"));
		const fileSizeInBytes = stats.size;

		const response = await fetch(`https://www.googleapis.com/upload/chromewebstore/v1.1/items/${core.getInput("chrome-extension-id")}`, {
			method: "PUT",
			headers: {
				"Authorization": `Bearer ${access_token}`,
				"x-goog-api-version": 2,
				"Content-length": fileSizeInBytes
			},
			body: readStream
		})

		const data = await response.json()

		if(data.uploadState && data.uploadState === "FAILURE") {
			core.setFailed(data.itemError[0].error_detail)
		} else if(response.status !== 200) {
			if(data.error) {
				throw new Error(data.error.message)
			} else {
				core.setFailed(data)
			}
		} else {
			core.info("Successfully published your browser extension.")
		}

	} catch (error) {
		core.setFailed(error.message)
	}

})()
