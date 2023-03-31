# Easy Chat

[Easy Chat](https://paul-gauthier.github.io/easy-chat/)
is a user interface for ChatGPT, designed specifically for early readers.

## Features

- Simple and intuitive user interface.
- Typography and text spacing which is helpful for early or struggling readers.
- Large, easy-to-read text in Open Dyslexic font.
- Supports text-to-speech of individual words by clicking on them.
- Immersive Reading of entire messages by clicking the speaker button -- highlights each word as it is read aloud at a moderate reading speed.
- A system prompt that tells ChatGPT it is speaking to a child and requesting it to use common words, short sentences and short paragraphs.

## Usage

Try it out here: [Easy Chat](https://paul-gauthier.github.io/easy-chat/)

## Created by ChatGPT

Almost all the code in this repository was written by ChatGPT.
I started by asking it to create the html for a simple chat app, with embedded css and js.
After that, I kept feeding it the entire html/js/css blob and requesting changes.

### Example prompts

Most of my prompts were basically feature requests, like you might file in a JIRA ticket.
Here's an example prompt:

```
Start with keyboard focus on the input box.
Put focus back there after sending each messages.
```

Which resulted in [these changes](https://github.com/paul-gauthier/easy-chat/commit/ec5ad8daf2145afcde2b8804bb7a7c88b137deb3) to the code, which modified some html and js:

```
diff --git a/chat.html b/chat.html
index 96f909d..95c0ab8 100644
--- a/chat.html
+++ b/chat.html
@@ -125,7 +125,7 @@
                        <div id="bottom"></div>
                </div>
                <div class="input-box">
-                       <textarea placeholder="Type your message here..." autofocus></textarea>
+                       <textarea placeholder="Type your message here..."></textarea>
                        <button>Send</button>
                         <div class="spinner"></div>
                </div>
@@ -178,7 +178,6 @@
                                                document.getElementById('bottom').scrollIntoView();
                                                 spinner.style.display = 'none';
                                                 sendButton.style.display = 'inline-block';
-                                                inputBox.focus();
                                        })
                                        .catch(error => console.log(error));
                        }
```                        

I didn't start recording the actual prompts until I was a couple of dozen commits into the process.
I was kind of suprised at how much I was accomplishing by treating ChatGPT as a junior web developer.

One of the most impressive changes was to take the empty shell of a chat UI and
[wire it up to the OpenAI chat completions API](https://github.com/paul-gauthier/easy-chat/commit/61326c036fa7888e58231f4bcb4f13d0f889ea0c).
I don't have a record of the exact prompt I used, but I basically said "wire it up" and pasted
a dozen lines of the `curl` example from the [API reference docs](https://platform.openai.com/docs/api-reference/chat).

You can see many of the prompts I used in the
[git history of this repo](https://github.com/paul-gauthier/easy-chat/commits/main).
Any commit that starts with "PROMPT" was created almost entirely by ChatGPT.
If the commit starts with "asked for ...", that also means ChatGPT did the coding, but I didn't record the exact prompt.

### Workflow

My workflow for each change was dead simple:

  - I placed my change request in a file called `prompt.txt`.
  - Fed the prompt and the entire codebase to ChatGPT via the [aichat](https://github.com/sigoden/aichat) tool:
    - `cat prompt.txt chat.html | aichat -r webdev > tmp.html && cp tmp.html chat.html`
  - Did a `git diff` to review what ChatGPT had changed and tried out the resulting system.
  - If it was good, `git commit`
  - If it wasn't right, I would use `git stash` to discard the changes, adjust the prompt and try again.

I used the roles feature of [aichat](https://github.com/sigoden/aichat) to set a system prompt, which was along these lines:

```
I want you to act as a web development expert.
I want you to answer only with code.
Make the requested change to the provided code and output the changed code.
MAKE NO OTHER CHANGES!
Do not provide explanations!
```

### Limitations

My workflow broke down when the size of the prompt and codebase exceeded the context window for ChatGPT 3.5 turbo.
I experimented with numerous other workflows to try and work around this limit, but with little consistent success.

