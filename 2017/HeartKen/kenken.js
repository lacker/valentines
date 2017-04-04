
// Tries to remove the items in b from a.
// If the items in b are not in a, returns null.
// Otherwise returns a list of the other items.
function diff(a, b) {
  let bIndex = 0;
  let answer = [];
  for (let item of a) {
    if (b[bIndex] === item) {
      bIndex++;
    } else {
      answer.push(item);
    }
  }
  if (answer.length == a.length - b.length) {
    return answer;
  } else {
    return null;
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function logSquare(arr) {
  let line = [];
  for (let value of arr) {
    line.push(value);
    if (line.length == size) {
      console.log(line);
      line = [];
    }
  }
}

// Merges two ascending lists, deduping.
function merge(a, b) {
  let answer = [];
  let aIndex = 0;
  let bIndex = 0;
  while (aIndex < a.length || bIndex < b.length) {
    if (aIndex >= a.length) {
      answer.push(b[bIndex]);
      bIndex++;
    } else if (bIndex >= b.length) {
      answer.push(a[aIndex]);
      aIndex++;
    } else if (a[aIndex] < b[bIndex]) {
      answer.push(a[aIndex]);
      aIndex++;
    } else if (a[aIndex] > b[bIndex]) {
      answer.push(b[bIndex]);
      bIndex++;
    } else {
      // Dupe
      answer.push(a[aIndex]);
      aIndex++;
      bIndex++;
    }
  }
  return answer;
}

// Returns a list of two indices that have the same value. Randomly
function makeHeartCage(values) {
  let index1 = Math.floor(Math.random() * values.length);
  let heartValue = values[index1];
  let possible = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i] === heartValue && i !== index1) {
      possible.push(i);
    }
  }
  let index2 = choose(possible);
  let answer = [index1, index2];
  answer.sort((a, b) => (a - b));
  return answer;
}

// A "cage" here is a list of variable indices from 0 .. sideLength ^ 2 - 1
// exclude is a list of indices to exclude because they already got caged
// Returns a list of cages
function randomCages(sideLength, exclude) {
  // indices is just the order we'll process the indices in
  let indices = [];

  // cageForIndex maps index to the cage it's in, or null if not known yet
  let cageForIndex = [];

  for (let i = 0; i < sideLength * sideLength; i++) {
    indices.push(i);
    cageForIndex.push(null);
  }
  shuffle(indices);

  let cages = [];
  for (let index of indices) {
    if (exclude.includes(index)) {
      continue;
    }
    let adjacent = [];
    if (index % sideLength !== 0) {
      adjacent.push(index - 1);
    }
    if ((index + 1) % sideLength !== 0) {
      adjacent.push(index + 1);
    }
    if (index - sideLength >= 0) {
      adjacent.push(index - sideLength);
    }
    if (index + sideLength < sideLength * sideLength) {
      adjacent.push(index + sideLength);
    }

    // Lower cage score is better.
    // Heuristics chosen so that cages can be size-4 but
    // not so frequently the puzzle has multiple solutions
    let bestCage = null;
    let bestCageScore = 100;

    for (let index of adjacent) {
      let cage = cageForIndex[index];
      if (cage === null) {
        continue;
      }

      let score = cages[cage].length;

      if (score === 3 && Math.random() < 0.9) {
        continue;
      }
      if (score >= 4) {
        continue;
      }
      if (score < bestCageScore) {
        bestCage = cage;
        bestCageScore = score;
      }
    }

    if (bestCage === null) {
      bestCage = cages.length;
      cages.push([]);
    }
    cageForIndex[index] = bestCage;
    cages[bestCage].push(index);
  }

  return cages;
}

// Returns a list of lists.
// Subsets are in the same order as the superset
function allSubsets(items, numItems, allowDupes) {
  if (numItems === 0) {
    return [[]];
  }
  if (!allowDupes && numItems > items.length) {
    return [];
  }
  if (items.length === 0) {
    return [];
  }
  let answer = [];

  // First handle the cases where we do take the first item
  let firstItem = items[0];
  let otherItems = items.slice(1);
  let tails = allSubsets(
    allowDupes ? items : otherItems,
    numItems - 1,
    allowDupes);
  for (let tail of tails) {
    answer.push([firstItem].concat(tail));
  }

  // Then handle the cases where we don't take the first item
  return answer.concat(allSubsets(otherItems, numItems, allowDupes));
}

// operation can be either '*' or '+'
function runOperation(operation, numbers) {
  switch (operation) {
    case '+':
    return numbers.reduce((a, b) => (a + b), 0);

    case '*':
    return numbers.reduce((a, b) => (a * b), 1);

    default:
    throw new Error('bad operation: ' + operation);
  }
}

// Makes the containers for a particular cage
// result is what everything is supposed to go into
// each container should be numValues values in [1, size]
function makeContainers(operation, result, numValues, size) {
  let containers = [];
  let domain = [];
  for (let i = 1; i <= size; i++) {
    domain.push(i);
  }
  for (let container of allSubsets(domain, numValues, true)) {
    if (runOperation(operation, container) === result) {
      containers.push(container);
    }
  }
  return containers;
}

// cage is a list of indices in values.
// it is thus the "variables" arg to addConstraint.
// returns an object with {description, containers}.
function makeCageConstraint(values, cage, size) {
  let operation = choose(['*', '+']);
  let numbers = [];
  for (let index of cage) {
    numbers.push(values[index]);
  }
  let result = runOperation(operation, numbers);
  let containers = makeContainers(operation, result, cage.length, size);
  let description = '' + result;
  if (numbers.length > 1) {
    description += operation;
  }
  return {
    description: description,
    containers: containers,
  };
}

// Intersects two ascending lists.
function intersect(a, b) {
  let answer = [];
  let aIndex = 0;
  let bIndex = 0;
  while (aIndex < a.length && bIndex < b.length) {
    if (a[aIndex] < b[bIndex]) {
      aIndex++;
    } else if (a[aIndex] > b[bIndex]) {
      bIndex++;
    } else {
      // They must be equal
      answer.push(a[aIndex]);
      aIndex++;
      bIndex++;
    }
  }
  return answer;
}

// soFar is an ascending list of numbers
// containers is a list of ascending lists of numbers
// This returns an ascending list of all numbers that could be added to
// soFar while keeping soFar as a sublist of one of the containers.
function possibilities(soFar, containers) {
  let answer = [];
  for (let container of containers) {
    let d = diff(container, soFar);
    if (d !== null) {
      answer = merge(answer, d);
    }
  }
  return answer;
}

// Does backtracking
class Puzzle {
  constructor(numVariables) {
    this.numVariables = numVariables;

    // Each constraint is an object with:
    // variables: a list of ints, indices in [0, numVariables). In order
    // containers:
    //       A list of sets. The constraint is that the variables must
    //       map to one of these sets. A "set" here is an ascending
    //       list of integers.
    // description: a string describing this constraint
    this.constraints = [];

    // Maps to a list of indices in this.constraints
    this.constraintsForVariable = [];
    for (let i = 0; i < this.numVariables; i++) {
      this.constraintsForVariable.push([]);
    }
  }

  // The constraint is that the variables specified in 'variables' must
  // be a subset of one of the lists in 'containers'.
  addConstraint(variables, containers, description) {
    let index = this.constraints.length;
    this.constraints.push({
      variables: variables,
      containers: containers,
      description: description,
    });
    for (let v of variables) {
      this.constraintsForVariable[v].push(index);
    }
  }

  // Returns a list of the possible values that could come next.
  possibleNext(values) {
    if (values.length >= this.numVariables) {
      throw 'values is too long for possibleNext';
    }

    // The constraints that are relevant to the next value
    let constraintIndices = this.constraintsForVariable[values.length];

    // If answer is non-null, it's a superset of the possible values.
    // This is because any possible value must meet each constraint.
    let answer = null;

    for (let constraintIndex of constraintIndices) {
      let constraint = this.constraints[constraintIndex];

      // Let's find partial solutions, that are at least ok with
      // this constraint.
      // First figure out what values are already filled in, for this
      // constraint.
      let alreadyFilled = [];
      for (let index of constraint.variables) {
        if (index >= values.length) {
          break;
        }
        alreadyFilled.push(values[index]);
      }
      alreadyFilled.sort(); // NOTE: this assumes numbers are < 10 !

      let partials = possibilities(alreadyFilled, constraint.containers);
      if (answer === null) {
        answer = partials;
      } else {
        answer = intersect(answer, partials);
      }

      // Shortcut
      if (answer.length == 0) {
        return answer;
      }
    }

    return answer;
  }

  // Solves with backtracking.
  // values is the variable values that have been figured out so far.
  // method can be: 'reverse' or 'random'. others do it in order
  // Returns a list of values if there's a solution.
  // Returns null otherwise.
  solve(values, method) {
    if (values.length === this.numVariables) {
      return values;
    }
    let possible = this.possibleNext(values);
    if (method === 'reverse') {
      possible.reverse();
    } else if (method === 'random') {
      shuffle(possible);
    }
    for (let nextValue of possible) {
      const answer = this.solve(values.concat([nextValue]), method);
      if (answer !== null) {
        return answer;
      }
    }
    return null;
  }

  // Solves twice if possible.
  // Only once or zero times if that's all that's possible.
  // Returns a list of solutions.
  multisolve() {
    // Solve forwards
    let solution1 = this.solve([]);
    if (solution1 === null) {
      return [];
    }
    let solution2 = this.solve([], 'reverse');
    if (JSON.stringify(solution1) === JSON.stringify(solution2)) {
      // There's only one solution
      return [solution1];
    } else {
      return [solution1, solution2];
    }
  }
}

// Creates a Puzzle whose constraints just represent a valid Sudoku board.
// 'size' is the length of one side length of the square.
function anySudoku(size) {
  let puzzle = new Puzzle(size * size);

  // Each row and column has a container list with just one
  // legitimate container - the list of 1..size numbers
  let validNumbers = [];
  for (let i = 1; i <= size; i++) {
    validNumbers.push(i);
  }
  const containers = [validNumbers];

  for (let i = 0; i < size; i++) {
    let row = [];
    let col = [];
    for (let j = 0; j < size; j++) {
      row.push(i * size + j);
      col.push(j * size + i);
    }
    puzzle.addConstraint(row, containers);
    puzzle.addConstraint(col, containers);
  }

  return puzzle;
}

// Returns {puzzle, solution} for a valid KenKen puzzle.
// In particular it should have exactly one solution.
export default function kenken(size) {
  let tries = 0;
  while (true) {
    tries++;

    // Fill in a puzzle in a sudoku-valid way
    let puzzle = anySudoku(size);
    let values = puzzle.solve([], 'random');
    let heartCage = makeHeartCage(values);
    let cages = randomCages(size, heartCage);

    // cageForIndex helps draw cages
    let cageForIndex = [];

    // Maps index to the description to *show* there
    let descriptions = Array(size * size).fill(null);

    // Index zero is the heartCage
    for (let heartIndex of heartCage) {
      descriptions[heartIndex] = '❤️️';
      cageForIndex[heartIndex] = 0;
    }
    let heartConstraint = [];
    for (let i = 1; i <= size; i++) {
      heartConstraint.push([i, i]);
    }
    puzzle.addConstraint(heartCage, heartConstraint, 'h');

    for (let i = 0; i < cages.length; i++) {
      let cage = cages[i];
      for (let index of cage) {
        cageForIndex[index] = i + 1;
      }
      let constraint = makeCageConstraint(values, cage, size);
      // console.log('constraint', i, '=', constraint);
      puzzle.addConstraint(
        cage, constraint.containers, constraint.description);
      descriptions[Math.min(...cage)] = constraint.description;
    }
    puzzle.cageForIndex = cageForIndex;
    puzzle.descriptions = descriptions;
    let multi = puzzle.multisolve();

    console.log('XXX', descriptions);
    logSquare(values);
    console.log();
    logSquare(cageForIndex);

    /* I used this to debug how fast it would take to generate a puzzle.
    console.log();
    logSquare(cageForIndex);
    console.log();
    logSquare(values);
    console.log();
    console.log(multi);
    console.log(multi.length);
    console.log('Try #', tries);
    */

    if (multi.length === 1) {
      return {
        puzzle: puzzle,
        solution: multi[0],
      };
    }
  }
}

const size = 6;
let p = kenken(size);
