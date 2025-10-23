/**
 * Configuration for Deep Tree Echo State Network reservoir
 */
export interface DeepTreeESNConfig {
    /** Number of reservoir nodes */
    reservoirSize: number;
    /** Spectral radius for echo state property */
    spectralRadius: number;
    /** Input scaling factor */
    inputScaling: number;
    /** Leak rate for neuron dynamics */
    leakRate: number;
    /** Sparsity of reservoir connections */
    sparsity: number;
    /** Tree depth for hierarchical structure */
    treeDepth: number;
    /** Affective resonance coefficient */
    affectiveResonance: number;
}

/**
 * Represents a reservoir node with affective properties
 */
export class ReservoirNode {
    public state: number[];
    public affectiveState: number;
    public activation: number;
    public connections: Map<number, number>;

    constructor(size: number) {
        this.state = new Array(size).fill(0);
        this.affectiveState = 0;
        this.activation = 0;
        this.connections = new Map();
    }

    /**
     * Update node state with input and affective modulation
     */
    public update(input: number[], leakRate: number, affectiveModulation: number): void {
        const newState = this.state.map((s, i) => {
            const inputContribution = input[i] || 0;
            const affinityFactor = 1 + affectiveModulation * this.affectiveState;
            return (1 - leakRate) * s + leakRate * Math.tanh(inputContribution * affinityFactor);
        });
        this.state = newState;
        this.activation = Math.tanh(this.state.reduce((a, b) => a + b, 0) / this.state.length);
    }

    /**
     * Update affective state based on resonance
     */
    public updateAffectiveState(resonance: number): void {
        this.affectiveState = 0.9 * this.affectiveState + 0.1 * resonance;
    }
}

/**
 * Deep Tree Echo State Network with affective resonance
 * Implements reservoir computing with hierarchical tree structure
 */
export class DeepTreeEchoStateNetwork {
    private config: DeepTreeESNConfig;
    private nodes: ReservoirNode[][];
    private reservoirMatrix: number[][] = [];
    private inputWeights: number[][] = [];
    private outputWeights: number[][] = [];
    private currentState: number[];
    private affectiveGlobalState: number;

    constructor(config: DeepTreeESNConfig) {
        this.config = config;
        this.nodes = [];
        this.currentState = [];
        this.affectiveGlobalState = 0;
        
        this.initializeReservoir();
        this.initializeWeights();
    }

    /**
     * Initialize hierarchical reservoir structure
     */
    private initializeReservoir(): void {
        // Create tree-structured reservoir layers
        for (let depth = 0; depth < this.config.treeDepth; depth++) {
            const layerSize = Math.floor(this.config.reservoirSize / Math.pow(2, depth));
            const layer: ReservoirNode[] = [];
            
            for (let i = 0; i < layerSize; i++) {
                const node = new ReservoirNode(10); // Each node has 10 internal states
                layer.push(node);
            }
            
            this.nodes.push(layer);
        }

        // Initialize reservoir connectivity matrix
        this.reservoirMatrix = this.createReservoirMatrix();
    }

    /**
     * Create sparse reservoir connectivity matrix with spectral radius constraint
     */
    private createReservoirMatrix(): number[][] {
        const totalNodes = this.nodes.reduce((sum, layer) => sum + layer.length, 0);
        const matrix: number[][] = Array(totalNodes).fill(0).map(() => 
            Array(totalNodes).fill(0)
        );

        // Create sparse random connections
        for (let i = 0; i < totalNodes; i++) {
            for (let j = 0; j < totalNodes; j++) {
                if (Math.random() < this.config.sparsity) {
                    matrix[i][j] = (Math.random() - 0.5) * 2;
                }
            }
        }

        // Scale to spectral radius
        this.scaleToSpectralRadius(matrix);
        
        return matrix;
    }

    /**
     * Scale matrix to desired spectral radius for echo state property
     */
    private scaleToSpectralRadius(matrix: number[][]): void {
        // Approximate spectral radius using power iteration
        const n = matrix.length;
        let v = Array(n).fill(1);
        
        for (let iter = 0; iter < 100; iter++) {
            const newV = Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    newV[i] += matrix[i][j] * v[j];
                }
            }
            const norm = Math.sqrt(newV.reduce((sum, val) => sum + val * val, 0));
            v = newV.map(val => val / norm);
        }

        const eigenvalue = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
        const scale = this.config.spectralRadius / eigenvalue;

        // Scale matrix
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                matrix[i][j] *= scale;
            }
        }
    }

    /**
     * Initialize input and output weights
     */
    private initializeWeights(): void {
        const totalNodes = this.nodes.reduce((sum, layer) => sum + layer.length, 0);
        
        // Random input weights with scaling
        this.inputWeights = Array(totalNodes).fill(0).map(() =>
            Array(10).fill(0).map(() => (Math.random() - 0.5) * 2 * this.config.inputScaling)
        );

        // Initialize output weights (will be trained)
        this.outputWeights = Array(10).fill(0).map(() =>
            Array(totalNodes).fill(0)
        );
    }

    /**
     * Process input through reservoir with affective modulation
     */
    public process(input: number[]): number[] {
        const affectiveModulation = this.config.affectiveResonance * this.affectiveGlobalState;

        // Update all reservoir nodes
        let nodeIndex = 0;
        for (const layer of this.nodes) {
            for (const node of layer) {
                const weightedInput = this.inputWeights[nodeIndex].map((w, i) => w * (input[i] || 0));
                node.update(weightedInput, this.config.leakRate, affectiveModulation);
                nodeIndex++;
            }
        }

        // Collect reservoir states
        this.currentState = [];
        for (const layer of this.nodes) {
            for (const node of layer) {
                this.currentState.push(node.activation);
            }
        }

        // Compute output
        const output = this.outputWeights.map(weights =>
            weights.reduce((sum, w, i) => sum + w * (this.currentState[i] || 0), 0)
        );
        
        return output;
    }

    /**
     * Update affective resonance based on attention and emotion
     */
    public updateAffectiveResonance(attention: number, emotion: number): void {
        const resonance = attention * emotion;
        this.affectiveGlobalState = 0.8 * this.affectiveGlobalState + 0.2 * resonance;

        // Update individual node affective states
        for (const layer of this.nodes) {
            for (const node of layer) {
                node.updateAffectiveState(resonance);
            }
        }
    }

    /**
     * Train output weights using ridge regression
     */
    public train(inputs: number[][], targets: number[][], ridge: number = 1e-6): void {
        const states: number[][] = [];
        
        // Collect reservoir states for all inputs
        for (const input of inputs) {
            this.process(input);
            states.push([...this.currentState]);
        }

        // Ridge regression: W = (S^T S + ridge * I)^-1 S^T T
        const statesT = this.transpose(states);
        const statesT_states = this.matrixMultiply(statesT, states);
        
        // Add ridge regularization
        for (let i = 0; i < statesT_states.length; i++) {
            statesT_states[i][i] += ridge;
        }

        const inverse = this.pseudoInverse(statesT_states);
        const statesT_targets = this.matrixMultiply(statesT, targets);
        this.outputWeights = this.transpose(this.matrixMultiply(inverse, statesT_targets));
    }

    /**
     * Get current reservoir state
     */
    public getState(): number[] {
        return [...this.currentState];
    }

    /**
     * Get affective state
     */
    public getAffectiveState(): number {
        return this.affectiveGlobalState;
    }

    /**
     * Get reservoir configuration
     */
    public getConfig(): DeepTreeESNConfig {
        return {...this.config};
    }

    // Matrix operations helpers

    private transpose(matrix: number[][]): number[][] {
        if (matrix.length === 0) return [];
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    private matrixMultiply(a: number[][], b: number[][]): number[][] {
        const result: number[][] = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < a[0].length; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    private pseudoInverse(matrix: number[][]): number[][] {
        // Simplified pseudo-inverse using Gaussian elimination
        // For production, use a proper linear algebra library
        const n = matrix.length;
        const augmented: number[][] = matrix.map((row, i) => 
            [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]
        );

        // Forward elimination
        for (let i = 0; i < n; i++) {
            let maxRow = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = j;
                }
            }
            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

            for (let j = i + 1; j < n; j++) {
                const factor = augmented[j][i] / augmented[i][i];
                for (let k = i; k < 2 * n; k++) {
                    augmented[j][k] -= factor * augmented[i][k];
                }
            }
        }

        // Back substitution
        for (let i = n - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                const factor = augmented[j][i] / augmented[i][i];
                for (let k = 0; k < 2 * n; k++) {
                    augmented[j][k] -= factor * augmented[i][k];
                }
            }
            const divisor = augmented[i][i];
            for (let k = 0; k < 2 * n; k++) {
                augmented[i][k] /= divisor;
            }
        }

        return augmented.map(row => row.slice(n));
    }
}
