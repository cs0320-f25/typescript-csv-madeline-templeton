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

Create an error type that gives enough information to be useful to the caller. This should contain, at minimum: 
the row number (or index); and 
the error from Zod. 

### Design Choices
User story 4: I implemented the CSVParseError to satisfy user story 3. It takes in information about the error (location, type, file etc.) and returns a user friendly message explaining what happened. It does this via the createUserFriendlyMessage() function which uses information passed to the csvParseError to create a message detailing what happened. I included the file name (optional), rowNumber, errorType, and raw data so that the user can pinpoint exactly what went wrong and where it happened. The csvParseError function is invoked in the parseBatch and parsCSVGenerator functions. 

The parser stops immediately on the first validation error so that the user can promptly fix the error and it will not cause issues later on. 

### 1340 Supplement

- #### 1. Correctness

- #### 2. Random, On-Demand Generation

- #### 3. Overall experience, Bugs encountered and resolved

#### Errors/Bugs:
#### Tests:
#### How To…

#### Team members and contributions (include cs logins):

#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI):
#### Total estimated time it took to complete project: 6 hours
#### Link to GitHub Repo:  https://github.com/cs0320-f25/typescript-csv-madeline-templeton
