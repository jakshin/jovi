/**
 * Jovi's minimalist AST.
 *
 * This thingy lets you add arbitrary nodes to the AST,
 * and keeps track of the current block at which nodes will be added.
 */
class AST {
  /** Creates a new instance. */
  constructor() {
    this._root = { children: [] }
    this._currentNode = this._root
  }

  /**
   * Adds a node.
   * Subsequent calls to add() or addBlock() will add nodes as siblings to this node.
   */
  add(node) {
    if (!node.op || typeof node.op !== "string") {
      const err = new Error(`AST nodes must have an 'op' property`)
      err.astNode = node
      throw err
    }

    if (!this._currentNode.children) {
      this._currentNode.children = []
    }

    this._currentNode.children.push(node)
  }

  /**
   * Adds a node which starts a new block.
   * Subsequent calls to add() or addBlock() will add to this node, i.e. inside the block.
   */
  addBlock(node) {
    if (!node.op || typeof node.op !== "string") {
      const err = new Error(`AST nodes must have an 'op' property`)
      err.astNode = node
      throw err
    }

    this.add(node)
    node.parent = this._currentNode
    this._currentNode = node
  }

  /**
   * Ends the current block.
   * Subsequent calls to add() or addBlock() will add to the block's parent node.
   * It's a safe no-op when there is no open block, i.e. when the tree's root is the current node.
   */
  endBlock() {
    if (this._currentNode !== this._root) {
      this._currentNode = this._currentNode.parent
    }
  }

  /**
   * Reports whether we're inside a certain type of node,
   * i.e. whether the current node or any parent has an operation which matches the passed type.
   */
  inside(type) {
    for (let node = this._currentNode; node !== this._root; node = node.parent) {
      if (node.op === type) {
        return true
      }
    }

    return false
  }

  /**
   * Gets the current node's `op` code string, i.e. which kind of block we're currently in (if any).
   * The root node's op is undefined; it is the only node with an undefined op.
   */
  get currentOp() {
    return this._currentNode.op
  }

  /**
   * Gets the entire AST structure,
   * which has a root node representing the program as a whole.
   */
  get root() {
    return this._root
  }
}

module.exports = { AST }
