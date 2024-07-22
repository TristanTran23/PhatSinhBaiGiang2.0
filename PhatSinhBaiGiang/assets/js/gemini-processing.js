const apiUrl = "http://192.168.11.243";

async function sendQuestionToAgent(userQuestion, outputid, parentid) {
	//$(output).html("<img src='/template/frontend/images/generating2.gif' style='width: 50px !important;' />");
	const response = await fetch(apiUrl + "getGeminiAnswer", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			question: userQuestion,
			gemini_model: "gemini-1.5-pro"
		}),
	});
	const reader = response.body.getReader();
	var responseText = "";
	var responseHtml = "";
	var converter = new showdown.Converter();
	const decoder = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true, BOMseen: true });
	
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;

		responseText += decoder.decode(value, { stream: true }); //Decodeuint8arr(value);
		responseHtml = responseText.replace(/_/g, 'emdash');
		responseHtml = converter.makeHtml(responseHtml).replace('\n', '<br>');
		responseHtml = responseHtml.replace(/emdash/g, '_');

		const reg = /\【.+\】/g;
		responseHtml = responseHtml.replace(reg, "");
		//document.getElementById('result').innerHTML = responseHtml;
		$(`#${outputid}`).html(responseHtml);

		var element = document.getElementById(parentid);
		var currentHeight = element.scrollHeight;
		element.scrollTop = currentHeight;
	}
	
	
	console.log('Response fully received');
}