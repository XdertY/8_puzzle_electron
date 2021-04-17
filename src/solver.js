const finalState = [0,1,2,3,4,5,6,7,8];
// [x,x,x --- index = 3 (1,0) --> corY = index(mod 3), corX = corY + 1
//  x,8,x     index = 4 (1,1) --> 4 % 3 = 1 -> corX, corY = 4/3 = 1 (1)  
//  x,x,x     index = 7 (2,1) --> 7%3 = 2 -> corX, corY = 7/3 = 2 (1)
// ]



const stateTemplate = {
    // permutation: [1,2,0,3,4,5,6,7,8],
    // 012345678
    permutation: [4,7,5,1,6,2,0,8,3],
    parent: null,
    f: 0,
    g: 0,
    h: 0,
}


const generatePath = (state) => {
    let result = [state.permutation];
    let cameFrom = state.parent;
    while(cameFrom) { 
        result.unshift(cameFrom.permutation);
        cameFrom = cameFrom.parent;
    }

    const drawBoard = (permutation) => {
        let str = "";
        permutation.forEach((el, index) => {
            if(index % 3 === 0) str += `\n`;
            if(el === 0) str += " | |";
            else str += ` |${el}|`
        })
        console.log(str);
        console.log("\n")
    }

    result.forEach(drawBoard);
    return result;

}

//The start state is an object like the stateTemplate object, the front is an Array
const solver = (numbers, type) => {
    const startState = {
        permutation: numbers,
        parent: null,
        f: 0,
        g: 0,
        h: 0
    }
    let front = [startState];
    let visited = [];
    let goalReached = false;
    let result = 0;
    let counter = 0;
    while(front.length > 0) {
        let min = front[0].f;
        let nextElement = front[0];
        front.forEach(el => {if(el.f <= min) {
            min = el.f;
            nextElement = el;
        }});
        // sortFront(front);
        front = front.filter((el) => el.permutation.toString() !== nextElement.permutation.toString());
        if(counter % 1000 === 0) console.log(counter);
        counter ++;
        if(nextElement.permutation.toString() === finalState.toString()) {
            result = generatePath(nextElement);
            goalReached = true;
            break;
        }
        // if(!visited.reduce((acc, el) => { return acc || nextElement.permutation.toString() === el.permutation}, false)) {
        if(!visited.find(el => nextElement.permutation.toString() === el.permutation.toString())) {
            visited.push(nextElement);
            // front = [...front, ...generateNextOptions(nextElement, front)];
            generateNextOptions(nextElement, front,visited);
        }
        
    }
    // goalReached ? console.log(`Goal was reached in ${result} steps and ${counter}`) : console.error("Could not find the goal!");
    return {result, counter};

}

const compareStates = (a, b) => {
    // const manhatanA = calculateManhatanDistance(a);
    // const manhatanB = calculateManhatanDistance(b);

    //If -1 is returned from that comparator function, then a comes before b in the final array
    //Otherwise , they swap places
    return a.f <= b.f ? -1 : 1

}

const sortFront = (front) => {
    return front.sort(compareStates)
}

const calculateManhatanDistance = (state) => {
    return state.permutation.reduce((acc, current, index) => {
        if(current === 0) return acc;
        //We calculate the supposed coordinates in a 3X3 matrix from the array index
        const currCoords = {x: Math.floor(index / 3), y: index % 3};
        const targetCoords = {x: Math.floor(current / 3), y: current % 3};
        return acc + Math.abs(currCoords.x - targetCoords.x) + Math.abs(currCoords.y - targetCoords.y);
    }, 0)
}

const generateNextOptions = (currentState, front, visited, type) => {
    //TODO: Based on the current state, generate all the next possible states and return them
    let emptyBlockCoords;
    let emptyBlockArrayIndex;
    currentState.permutation.forEach((el, index) => {
        if(el === 0) {
            emptyBlockCoords = {x: Math.floor(index / 3), y: index % 3};
            emptyBlockArrayIndex = index;
        }
    });

    const isValid = ({x, y}) => {
        return (x >= 0 && x < 3 && y >= 0 && y < 3);
    }

    const directions = [
        {x: emptyBlockCoords.x, y : emptyBlockCoords.y - 1},
        {x: emptyBlockCoords.x + 1, y : emptyBlockCoords.y},
        {x: emptyBlockCoords.x, y : emptyBlockCoords.y + 1},
        {x: emptyBlockCoords.x - 1, y : emptyBlockCoords.y},
    ]

    

    directions.forEach(({x,y}) => {
        if(isValid({x,y})) {
            const newBlankArrayIndex = x*3 + y;
            let tempPermutation = [...currentState.permutation];
            let temp = tempPermutation[newBlankArrayIndex];
            tempPermutation[emptyBlockArrayIndex] = temp;
            tempPermutation[newBlankArrayIndex] = 0;
            let resultState = {
                permutation: tempPermutation,
                parent: currentState,
                g: 0,
                h: 0,
            };
            if(type === 1) resultState.g = currentState.g + 1;
            resultState.h = calculateManhatanDistance(resultState);
            resultState.f = type === 1 ? resultState.h + resultState.g : resultState.h;

            let existingStateIndex = 0;
            const existingState = front.find( (el, index) => {
                if(tempPermutation.toString() === el.permutation.toString()) {
                    existingStateIndex = index;
                    return true;
                }
            });
            if(existingState) {
                // resultState = resultState.f <= existingState.f ? resultState : existingState;
                // front[existingStateIndex] = resultState;
            }
           else if(!visited.find(el => el.permutation.toString() === tempPermutation.toString())) 
                front.push(resultState);

            // result.push(resultState);
        }
    })

    
};

export default solver