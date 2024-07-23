async function sendQuestionToAgent(userQuestion, systemPrompt, outputId, parentId) {
    const response = await fetch(apiUrl + "getGPTAnswer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                {role: "system", content: systemPrompt},
                {role: "user", content: userQuestion},
            ],
            model: "gpt-3.5-turbo"
        }),
    });

    const reader = response.body.getReader();
	$(`#${outputId}`).text(response);
    const decoder = new TextDecoder();
    const converter = new showdown.Converter();

    let buffer = '';
    while (true) {
        const { value, done } = await reader.read();
		$(`#${outputId}`.append("<div>1</div>"));
        if (done) break;

        buffer += decoder.decode(value);
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const jsonData = line.slice(6);
                if (jsonData === '[DONE]') {
                    console.log('Stream complete');
                    return;
                }
                try {
                    const { content } = JSON.parse(jsonData);
                    if (content) {
                        let htmlContent = converter.makeHtml(content);
                        $(`#${outputId}`).append(htmlContent);

                        const element = document.getElementById(parentId);
                        element.scrollTop = element.scrollHeight;
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }
        }
    }
}