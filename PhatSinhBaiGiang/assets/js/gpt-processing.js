const apiUrl = `https://api.openai.com/v1/models`;

async function sendQuestionToAgent(userQuestion, outputid, parentid) {
	//$(output).html("<img src='/template/frontend/images/generating2.gif' style='width: 50px !important;' />");
    var myHeader = new Hearder();
    myHeader.append(`Authorization: Bearer ${process.env.GPT_API_KEY}`);
	var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
    const response = await fetch("https://api.openai.com/v1/models", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
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