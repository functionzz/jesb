# DataFrame 💻
**The Flowing Canvas for Data Scientists, Hobbyists, and Students**

Check out the devpost [here](https://devpost.com/software/dataframe-y41tbl).
---

## Inspiration

DataFrame was inspired by the strengths—and limitations—of Jupyter Notebook.

While Jupyter is powerful, its strictly sequential execution model can make it difficult to see the bigger picture or work in a more flexible, visual way. We wanted to create something that encourages exploration, context, and collaboration.

The idea was simple:  
What if Jupyter Notebook and a visual canvas tool worked together?

---

## What It Does

DataFrame is a visual, free-flowing canvas for working with data.

Users can:
- Drag and place Python nodes on an infinite canvas  
- Connect nodes to form workflows  
- Execute code and view outputs interactively  
- Organize ideas spatially for better understanding  
- Create presentations and annotate directly in the workspace  

It’s designed for anyone who wants a more intuitive way to explore and present data.

---

## How We Built It

### Languages
- Python  
- TypeScript  

### Frameworks & Tools
- FastAPI (backend)  
- React (frontend)  
- Pyodide (Python in the browser via WebAssembly)  
- tldraw (infinite canvas system)  

---

## Challenges We Faced

### Version Control
We initially worked directly on the main branch, which led to significant merge conflicts. This highlighted the importance of proper branching and collaboration workflows.

### System Integration
Combining Pyodide with tldraw was a major challenge:
- Different execution and rendering models  
- Synchronization between code and canvas  
- Managing state across systems  

We approached this incrementally, and once the core integration worked, further development became much smoother.

---

## Accomplishments

- Built a full-stack, deployed application  
- Successfully executed Python code in the browser  
- Created a node-based workflow system on an infinite canvas  
- Integrated multiple complex technologies into a cohesive product  

---

## What We Learned

### Technical
- Backend development with FastAPI  
- Frontend architecture using React and TypeScript  
- Working with WebAssembly (Pyodide)  
- Designing interactive canvas-based interfaces  

### Process
- Importance of version control practices  
- Managing time effectively in a hackathon setting  
- Iterative development and problem solving  

---

## What’s Next

Planned improvements include:
- Parallel execution of nodes  
- Reactive inputs and live updates  
- Real-time collaboration  
- Integration with external datasets and APIs  
- Support for model training workflows  

DataFrame is designed as a flexible foundation that can grow into a powerful platform for visual data exploration.
