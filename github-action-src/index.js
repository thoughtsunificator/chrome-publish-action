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
				throw new Error("An error occured while retrieving access_token.")
			}
		}

		core.info("Successfully retrieved access token.")

		const access_token = responseFetchData.access_token

		const readStream = fs.createReadStream(core.getInput("zip"));
		const stats = fs.statSync(core.getInput("zip"));
		const fileSizeInBytes = stats.size;

		const responseUpload = await fetch(`https://www.googleapis.com/upload/chromewebstore/v1.1/items/${core.getInput("chrome-extension-id")}`, {
			method: "PUT",
			headers: {
				"Authorization": `Bearer ${access_token}`,
				"x-goog-api-version": 2,
				"Content-length": fileSizeInBytes
			},
			body: readStream
		})

		const responseUploadData = await responseUpload.json()

		if(responseUploadData.uploadState && responseUploadData.uploadState === "FAILURE") {
			core.setFailed(responseUploadData.itemError[0].error_detail)
		} else if(responseUpload.status !== 200) {
			if(responseUploadData.error) {
				throw new Error(responseUploadData.error.message)
			} else {
				throw new Error("An error occured while upload the extension.")
			}
		} else {
			core.info("Successfully uploaded your browser extension.")
		}

		const responsePublish = await fetch(`https://www.googleapis.com/chromewebstore/v1.1/items/${core.getInput("chrome-extension-id")}/publish`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${access_token}`,
				"x-goog-api-version": 2,
				"Content-length": fileSizeInBytes
			}
		})

		const responsePublishData = await responsePublish.json()

		if(responsePublish.status !== 200) {
			if(responsePublishData.error && responsePublishData.error.message) {
				throw new Error(responsePublishData.error.message)
			} else {
				throw new Error("An error occured while publishing the extension.")
			}
		} else {
			core.info("Successfully published your browser extension.")
		}

	} catch (error) {
		core.setFailed(error.message)
	}

})()
