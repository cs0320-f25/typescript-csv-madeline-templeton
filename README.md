# Sprint 1: TypeScript CSV

### Task C: Proposing Enhancement

- #### Step 1: Brainstorm on your own.

- #### Step 2: Use an LLM to help expand your perspective.

- #### Step 3: use an LLM to help expand your perspective.

    Include a list of the top 4 enhancements or edge cases you think are most valuable to explore in the next week’s sprint. Label them clearly by category (extensibility vs. functionality), and include whether they came from you, the LLM, or both. Describe these using the User Story format—see below for a definition. 
    
    Funtionality: 
    As a user, data can sometimes be messy and incomplete. I would like the parser to be able to parse files with missing data and mismatched types such as numbers spelled (one) instead of explicitly stated (1).
    As a user, I can parse files with embedded delimiters such as quotes and commas. 

    Extensibility: 
    As a user, I trust that I can parse any csv file, even ones with errors, without causing a crash. If there are errors, I trust the parser will alert me to them. 
    As a user, I would like the parser to return structured, validated data, preferably with infered types. 

    Include your notes from above: what were your initial ideas, what did the LLM suggest, and how did the results differ by prompt? What resonated with you, and what didn’t? (3-5 sentences.) 

    Initially, I was most concerned with obvious issues such as how the parser handles lines with multiple commas, quotes, empty fields etc. The first prompt I used with the LLM was biased by these concerns and subsequently suggested a number of tests concentrated on issues like these. However, when I revisited the issue in a secondary chat with a less narrowing prompt, I began to consider other functional issues such as error handling, and row transformation. The markedly different responses in different chats shocked me and perhaps helped me realize the value of revisiting problems, especially when using LLMs for help. In the future, I will certainly try to have separate chats whenever possible. 

### Design Choices

### 1340 Supplement

- #### 1. Correctness

- #### 2. Random, On-Demand Generation

- #### 3. Overall experience, Bugs encountered and resolved

#### Errors/Bugs:
#### Tests:
#### How To…

#### Team members and contributions (include cs logins):

#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI):
#### Total estimated time it took to complete project:
#### Link to GitHub Repo:  
