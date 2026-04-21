export interface ArrayElement {
  value: number;
  id: string;
  highlighted?: boolean;
  isNew?: boolean;
  isDeleting?: boolean;
}

export interface TreeNode {
  value: number;
  id: string;
  left?: TreeNode;
  right?: TreeNode;
  highlighted?: boolean;
  isNew?: boolean;
  isDeleting?: boolean;
}

export interface HeapNode {
  value: number;
  id: string;
  highlighted?: boolean;
  isNew?: boolean;
  isDeleting?: boolean;
}

let idCounter = 0;
export function genId(): string {
  return `node-${++idCounter}`;
}

export function buildBST(root: TreeNode | undefined, value: number): TreeNode {
  const newNode: TreeNode = { value, id: genId(), isNew: true };
  if (!root) return newNode;

  function insert(node: TreeNode): TreeNode {
    if (value < node.value) {
      return { ...node, left: node.left ? insert(node.left) : newNode };
    } else if (value > node.value) {
      return { ...node, right: node.right ? insert(node.right) : newNode };
    }
    return node;
  }
  return insert(root);
}

export function deleteBSTNode(root: TreeNode | undefined, value: number): TreeNode | undefined {
  if (!root) return undefined;
  if (value < root.value) {
    return { ...root, left: deleteBSTNode(root.left, value) };
  } else if (value > root.value) {
    return { ...root, right: deleteBSTNode(root.right, value) };
  } else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let minNode = root.right;
    while (minNode.left) minNode = minNode.left;
    return {
      ...root,
      value: minNode.value,
      id: root.id,
      right: deleteBSTNode(root.right, minNode.value),
    };
  }
}

export function insertMinHeap(heap: HeapNode[], value: number): HeapNode[] {
  const newHeap = [...heap, { value, id: genId(), isNew: true }];
  let i = newHeap.length - 1;
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (newHeap[parent].value > newHeap[i].value) {
      [newHeap[parent], newHeap[i]] = [newHeap[i], newHeap[parent]];
      i = parent;
    } else break;
  }
  return newHeap;
}

export function deleteMinHeap(heap: HeapNode[], index: number): HeapNode[] {
  if (heap.length === 0) return heap;
  const newHeap = [...heap];
  newHeap[index] = newHeap[newHeap.length - 1];
  newHeap.pop();
  let i = index;
  while (true) {
    let smallest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < newHeap.length && newHeap[left].value < newHeap[smallest].value) smallest = left;
    if (right < newHeap.length && newHeap[right].value < newHeap[smallest].value) smallest = right;
    if (smallest !== i) {
      [newHeap[smallest], newHeap[i]] = [newHeap[i], newHeap[smallest]];
      i = smallest;
    } else break;
  }
  return newHeap;
}

export function insertMaxHeap(heap: HeapNode[], value: number): HeapNode[] {
  const newHeap = [...heap, { value, id: genId(), isNew: true }];
  let i = newHeap.length - 1;
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (newHeap[parent].value < newHeap[i].value) {
      [newHeap[parent], newHeap[i]] = [newHeap[i], newHeap[parent]];
      i = parent;
    } else break;
  }
  return newHeap;
}

export function deleteMaxHeap(heap: HeapNode[], index: number): HeapNode[] {
  if (heap.length === 0) return heap;
  const newHeap = [...heap];
  newHeap[index] = newHeap[newHeap.length - 1];
  newHeap.pop();
  let i = index;
  while (true) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < newHeap.length && newHeap[left].value > newHeap[largest].value) largest = left;
    if (right < newHeap.length && newHeap[right].value > newHeap[largest].value) largest = right;
    if (largest !== i) {
      [newHeap[largest], newHeap[i]] = [newHeap[i], newHeap[largest]];
      i = largest;
    } else break;
  }
  return newHeap;
}

export function insertBinaryTree(root: TreeNode | undefined, value: number): TreeNode {
  const newNode: TreeNode = { value, id: genId(), isNew: true };
  if (!root) return newNode;

  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (!node.left) {
      node.left = newNode;
      return root;
    } else {
      queue.push(node.left);
    }
    if (!node.right) {
      node.right = newNode;
      return root;
    } else {
      queue.push(node.right);
    }
  }
  return root;
}

export function deleteBinaryTreeNode(root: TreeNode | undefined, value: number): TreeNode | undefined {
  if (!root) return undefined;

  let deepest: TreeNode | undefined;
  let nodeToDelete: TreeNode | undefined;
  let parent: TreeNode | undefined;
  let isLeft = false;

  const queue: Array<{ node: TreeNode; par?: TreeNode; left: boolean }> = [{ node: root, par: undefined, left: false }];

  while (queue.length > 0) {
    const { node, par, left } = queue.shift()!;
    deepest = node;
    parent = par;
    isLeft = left;
    if (node.value === value) nodeToDelete = node;
    if (node.left) queue.push({ node: node.left, par: node, left: true });
    if (node.right) queue.push({ node: node.right, par: node, left: false });
  }

  if (!nodeToDelete || !deepest) return root;

  nodeToDelete.value = deepest.value;
  nodeToDelete.id = deepest.id;

  if (parent) {
    if (isLeft) {
      parent.left = undefined;
    } else {
      parent.right = undefined;
    }
  } else {
    return undefined;
  }

  return root;
}

export interface TreeNodeWithPos extends TreeNode {
  x: number;
  y: number;
  left?: TreeNodeWithPos;
  right?: TreeNodeWithPos;
}

export function computeTreePositions(
  node: TreeNode | undefined,
  x: number,
  y: number,
  spread: number,
  levelHeight: number
): TreeNodeWithPos | undefined {
  if (!node) return undefined;
  return {
    ...node,
    x,
    y,
    left: computeTreePositions(node.left, x - spread, y + levelHeight, spread / 2, levelHeight),
    right: computeTreePositions(node.right, x + spread, y + levelHeight, spread / 2, levelHeight),
  };
}

export function treeHeight(node: TreeNode | undefined): number {
  if (!node) return 0;
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}
