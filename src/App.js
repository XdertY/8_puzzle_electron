import logo from './logo.svg';
import {useRef, useEffect, useState} from 'react'
import solver from './solver';
import arrayMove from 'array-move'
import './App.css';

function App() {
  // const [selectedSquare, setSelectedSquare] = useState(10);
  // const [originKey, setOriginKey] = useState(10);
  // const [targetKey, setTargetKey] = useState(null);
  // const[tiles, setTiles] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [itterationCount, setItterationCount] = useState(0);
  const [disableButtons, setDisableButtons] = useState(false);
  
  const solving = useRef(false);
  const selectedSquare = useRef(null);
  const tiles = useRef([]);
  const solved = useRef(false);
  // const originKey = useRef(10);
  const targetKey = useRef(null);

  useEffect(() => {
    console.log("Component did mount")
    const numbers = [0,1,2,3,4,5,6,7,8];
    buildTiles(numbers);
  

  } , [])

  const buildTiles = (numbers) => {
    tiles.current = (numbers.map(number => {
      console.log(number);
      console.log(number === 0);
      return <div id={number} key={number} className="square" draggable={!solved.current} onDragEnter={dragEnter} onDragOver={dragOverHandler} onDragLeave={dragLeaveHandler} onDrop={dropHandler}><p id={number}>{number === 0 ? "" : number}</p></div>
    }))
    console.log(tiles);
    setRefresh(new Date().getTime());
  }

  const isValidPermutation = (numbers) => {
    let transpositionCount = 0;
    let tempArray = [...numbers];
    for(let i = 0 ; i < 9; i++) {
      const currentNumberIndex = tempArray.findIndex(el => el === i);
      transpositionCount += currentNumberIndex - i;
      arrayMove.mutate(tempArray, currentNumberIndex, i);
    }
    console.log("result is", transpositionCount % 2 === 0);
    return (transpositionCount % 2 === 0);
    
  }

  // useEffect(() => {
  //   console.log("We are in the target useEffect")
  //   if(targetKey.current) {
  //     let targetIndex = 0;
  //     tiles.forEach((el,index) => {
  //       if(el.key - 0 === targetKey.current) targetIndex = index;
  //     });
      
  //     console.log("target index", targetIndex);

  //     let tempTiles = tiles;
  //     const targetEl = tiles[targetIndex];
  //     tempTiles[targetIndex] = tempTiles[selectedSquare];
  //     tempTiles[selectedSquare] = targetEl;
  //     console.log(tempTiles)
  //     setTiles(tempTiles)
  //   }
  // }, [targetKey.current])

  const dragOverHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  const dragLeaveHandler = (e) => {
    e.stopPropagation()
    e.preventDefault();
  }

  const dropHandler = (e) => {
    
      let targetIndex = 0;
      tiles.current.forEach((el,index) => {
        if(el.key === e.target.id) targetIndex = index;
      });
   

      let tempTiles = tiles.current;
      console.log(tempTiles[targetIndex]);
      const targetEl = tempTiles[targetIndex];
      tempTiles[targetIndex - 0] = tempTiles[selectedSquare.current];
      tempTiles[selectedSquare.current] = targetEl;
      console.log(tempTiles)

      tiles.current  = tempTiles;
      if(!isValidPermutation(tempTiles)) setDisableButtons(true);
      selectedSquare.current = null;
      setRefresh(Math.random())
  }

  const dragEnter = (e) => {
    e.stopPropagation()
    e.preventDefault();

    if(selectedSquare.current === null)  {
      console.log("selectedSquare")
      

      let elIndex = 0;
      tiles.current.forEach((el,index) => {
        if(el.key === e.target.id) elIndex = index;
      })
      
      selectedSquare.current = elIndex;
      console.log(selectedSquare);

    }
    
  };

  const solve = (type) => {
    const numbers = tiles.current.map(tile => tile.key - 0);
    console.log(numbers);
    const {result, counter} = solver(numbers, type)
    setItterationCount(counter);
    solved.current = true;
    generateSteps(result);
    console.log(result);
  }

  const generateSteps = (result) => {
    let steps = [{tiles: result[0], step: "Start"}];
    for(let i = 1; i < result.length; i++) {
      const last = result[i-1];
      const current = result[i];
      const currentBlankIndex = current.findIndex((el) => el === 0);
      steps.push({tiles: result[i], step: `Blank tile -> ${last[currentBlankIndex]}`})
    }
    setSteps(steps);
    setCurrentStep(0);
  }

  const randomizeHandler = () => {
    let arr = [];
    let numbers = []
    do {
      arr = [];
      numbers = [0,1,2,3,4,5,6,7,8]
      for(let i = 0; i < 9; i++) {
        const currNumber = Math.round(Math.random() * 8 - i);
        arr.push(numbers.splice(currNumber, 1)[0]);
      }
      console.log("while:",arr);
      
    } while(isValidPermutation(arr) === false); 

    console.log("the array is: ", arr);
   
    // numbers = [0,1,2,3,4,5,6,7,8]
    // for(let i = 0; i < 9; i++) {
    //   const currNumber = Math.round(Math.random() * 8 - i);
    //   arr.push(numbers.splice(currNumber, 1)[0]);
    // }
    
    setDisableButtons(false);
    buildTiles(arr);

  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  }

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    
  }

  useEffect(() => {
    if(currentStep >= 0)
      buildTiles(steps[currentStep].tiles);
  }, [currentStep])

  

  return (
    <div className="App">

      <header className="App-header">
        <h1>8-Puzzle Vizualizer</h1>
        {disableButtons ? <p style={{color: "red"}}>Има нечетен брой транспозиции, поради което не може да бъде намерено решение!</p> : null}
  
      <div className="main_container">
        <div className="tile_container">
            {tiles.current ? tiles.current : null }

            
            {/* <p>The Drop Zone</p> */}
          </div>
        <div className="panel_container">
          <div className="panel_divider"></div>
          {solved.current ? 
          <div className="panel_steps">
            <div className="panel_steps_controls">
              <button disabled={!(currentStep > 0)} onClick={() => prevStep()}>{"<"}</button>
              <p>{`${currentStep+1}/${steps.length}`}</p>
              <button disabled={!(currentStep + 1 < steps.length)} onClick={() => nextStep()}>{">"}</button>
              
            </div>

            <div className="panel_steps_info">

              <h2>Steps</h2>
              <p style={{whiteSpace: "nowrap"}}>{steps[currentStep].step}</p>

              <button className="reset_button" style={{marginLeft: "1rem"}} onClick={() => {
                solved.current = false
                setRefresh(new Date().getTime());
                buildTiles([0,1,2,3,4,5,6,7,8])
                }}>RESET</button>

            </div>

          </div>

          :
          <div className="panel_buttons">
            <button onClick={() => randomizeHandler()}>Randomize</button>
            <button disabled={disableButtons} onClick={() => solve(1)}>A*</button>
            <button disabled={disableButtons} onClick={() => solve(2)}>Best First Search</button>
          </div>
        }
          

         

        </div>
      </div>

        

      </header>
    </div>
  );
}

export default App;
