# Easy Chat

[Easy Chat](https://paul-gauthier.github.io/easy-chat/)
is a user interface for ChatGPT, designed specifically for young readers.
Almost all the code for Easy Chat was written by ChatGPT.

## Features

- Typography, layout and text spacing which is helpful for young, early or struggling readers.
- Large, easy-to-read text in the Open Dyslexic font.
- Text-to-speech of individual words by clicking on any word.
- Text-to-speech of entire passages with Immersive Reading (highlights each word as it is read aloud at a moderate reading speed). Click on the speaker icons.
- A system prompt that tells ChatGPT it is speaking to a child and to use common words, short sentences and short paragraphs.

![Screenshot of Easy Chat](screenshot.gif)

## Usage

Try it out here: [Easy Chat](https://paul-gauthier.github.io/easy-chat/)

## Created by ChatGPT

Almost all the code in this repository was written by ChatGPT, using what I think is a novel workflow.

I started by asking it to create the html for a simple chat app, with embedded css and js. After that, I just asked for changes, bug fixes, new features and improvements in plain English.

ChatGPT figured out how to make the requested changes, what parts of the code needed to be modified and what modifications to make.
I reviewed the diffs it generated, and either accepted or rejected the proposed changes. If the changes weren't acceptable, I discarded them and improved my request to be more specific or explicit -- and tried again.

In essence, I treated ChatGPT as a junior web developer.

### Example prompts

Most of my prompts were basically feature requests, like you might file in a JIRA ticket.
Here's an example prompt:

> Use text-to-voice to speak the highlighted word.

Which resulted in
[these changes](commits.md#user-content-62e0862ce0cf1017082e30ec7fa4034cfaf80137) to the code:

```
diff --git a/chat.html b/chat.html
index 4ed5668..7d3d563 100644
--- a/chat.html
+++ b/chat.html
@@ -206,8 +206,17 @@
                         const highlightedWords = chatBox.querySelectorAll('.highlight');
                         highlightedWords.forEach(word => word.classList.remove('highlight'));
                         event.target.classList.add('highlight');
+                        const textToSpeak = event.target.textContent;
+                        const speech = new SpeechSynthesisUtterance(textToSpeak);
+                        speechSynthesis.speak(speech);
                     }
                 });
+
+                /* New code for text-to-speech */
+                const speak = (text) => {
+                    const speech = new SpeechSynthesisUtterance(text);
+                    speechSynthesis.speak(speech);
+                };
        </script>
 </body>
 </html>
```                        

Here is another prompt, this time describing a bug and asking for a bug fix:

> The text-to-speech is saying "speaker outputting high volume" at the end of every message.
> I think it is reading the unicode speaker icon aloud.
> It should not.
> Fix this bug.

Which produced
[this simple fix](commits.md#user-content-2e73c58dccc4336f53264dd6b9b5093cf88b0d20):

```
diff --git a/chat.html b/chat.html
index b9f8ba3..8f6de60 100644
--- a/chat.html
+++ b/chat.html
@@ -207,7 +207,7 @@

                 /* New code for word highlighting */
                 chatBox.addEventListener('click', (event) => {
-                    if (event.target.tagName === 'SPAN') {
+                    if (event.target.tagName === 'SPAN' && !event.target.classList.contains('speaker')) {
                         const highlightedWords = chatBox.querySelectorAll('.highlight');
                         highlightedWords.forEach(word => word.classList.remove('highlight'));
                         event.target.classList.add('highlight');
```

One of the most impressive changes was when I asked it to take what was currently a non-functional chat UI and
[wire it up to the OpenAI chat completions API](commits.md#user-content-61326c036fa7888e58231f4bcb4f13d0f889ea0c).
I don't have a record of the exact prompt I used, but I basically said "wire it up like this" and pasted
a dozen lines of the `curl` example from the [API reference docs](https://platform.openai.com/docs/api-reference/chat).

Another shocking change occured when I asked ChatGPT to add a speaker button beside each chat message bubble.
I had previously asked it to use text-to-speech to speak individual words when clicked.
When I asked it to
[add a speaker button on every chat bubble](commits.md#user-content-cbae63b904561671b9df467584b3687a61939355)
, it wired them up to speak all the text in the bubble without me needing to ask.

I am missing the actual text of many of the earliest prompts I used.
I didn't start recording them until I was a couple of dozen commits into the process.
When I started, I didn't think I was going to make much progress using this style of "coding".
I am suprised at how much I was able to accomplish by treating ChatGPT as a junior web developer.

Regardless, you can review this
[curated commit history of this repo](commits.md)
to see many of the prompts I used.
Any commit that starts with "PROMPT" was coded by ChatGPT from that specific prompt.
If the commit starts with "asked for ...", that also means ChatGPT did the coding, but I didn't record the exact prompt.

### Workflow

My workflow for each change was dead simple:

  - I wrote my plain English change request in a file called `prompt.txt`.
  
  - I fed the prompt and the entire codebase to ChatGPT via the [aichat](https://github.com/sigoden/aichat) tool.
    - `cat prompt.txt chat.html | aichat -r webdev > tmp.html && cp tmp.html chat.html`

  - Each time, ChatGPT returned a modified version of the codebase, implementing my requested changes.
  
  - I did a `git diff` to review what ChatGPT had changed and tried out the resulting system.
    - If it was good, `git commit -F prompt.txt`
    - If it wasn't right, I would use `git stash` to discard the changes, adjust the prompt and try again.

I used the roles feature of [aichat](https://github.com/sigoden/aichat) to set up a `webdev` role with a system prompt like this:

> I want you to act as a web development expert.
> I want you to answer only with code.
> Make the requested change to the provided code and output the changed code.
> MAKE NO OTHER CHANGES!
> Do not provide explanations!

### Limitations

My workflow broke down when the size of the prompt and codebase exceeded the context window for the `gpt-3.5-turbo` model.
I experimented with numerous other workflows to try and work around this limit, but with little consistent success.

Ultimately I refactored the js and css into their own files, and began feeding ChatGPT excerpts from the code that were relevant to each change I needed.
This wasn't always successful, as it often wanted to (re)write the code that I wasn't showing it.

I look forward to GPT-4 API access, where I can take advantage of the 32k token context window.

