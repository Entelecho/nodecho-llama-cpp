/**
 * Membrane configuration for P-System
 */
export interface MembraneConfig {
    /** Membrane identifier */
    id: string;
    /** Depth in membrane hierarchy */
    depth: number;
    /** Permeability factor for object exchange */
    permeability: number;
    /** Evolutionary rate */
    evolutionRate: number;
}

/**
 * Represents an object within membrane
 */
export interface MembraneObject {
    type: string;
    multiplicity: number;
    state: number[];
}

/**
 * Evolution rule for membrane computing
 */
export interface EvolutionRule {
    input: string[];
    output: string[];
    condition: (state: Map<string, MembraneObject>) => boolean;
    priority: number;
}

/**
 * Membrane compartment in P-System
 */
export class Membrane {
    public config: MembraneConfig;
    public objects: Map<string, MembraneObject>;
    public children: Membrane[];
    public parent: Membrane | null;
    public rules: EvolutionRule[];

    constructor(config: MembraneConfig) {
        this.config = config;
        this.objects = new Map();
        this.children = [];
        this.parent = null;
        this.rules = [];
    }

    /**
     * Add object to membrane
     */
    public addObject(obj: MembraneObject): void {
        const existing = this.objects.get(obj.type);
        if (existing) {
            existing.multiplicity += obj.multiplicity;
            // Merge states
            existing.state = existing.state.map((s, i) => s + (obj.state[i] || 0));
        } else {
            this.objects.set(obj.type, {...obj});
        }
    }

    /**
     * Apply evolution rules
     */
    public evolve(): void {
        // Sort rules by priority
        const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);

        for (const rule of sortedRules) {
            if (rule.condition(this.objects)) {
                // Check if input objects are available
                const canApply = rule.input.every(type => {
                    const obj = this.objects.get(type);
                    return obj && obj.multiplicity > 0;
                });

                if (canApply) {
                    // Consume input objects
                    for (const type of rule.input) {
                        const obj = this.objects.get(type)!;
                        obj.multiplicity--;
                        if (obj.multiplicity === 0) {
                            this.objects.delete(type);
                        }
                    }

                    // Produce output objects
                    for (const type of rule.output) {
                        this.addObject({
                            type,
                            multiplicity: 1,
                            state: []
                        });
                    }
                }
            }
        }
    }

    /**
     * Transfer objects to child membrane
     */
    public sendToChild(childIndex: number, obj: MembraneObject): boolean {
        if (childIndex < this.children.length) {
            const transferAmount = Math.floor(obj.multiplicity * this.config.permeability);
            if (transferAmount > 0) {
                const transferObj = {
                    ...obj,
                    multiplicity: transferAmount
                };
                this.children[childIndex].addObject(transferObj);
                obj.multiplicity -= transferAmount;
                return true;
            }
        }
        return false;
    }

    /**
     * Transfer objects to parent membrane
     */
    public sendToParent(obj: MembraneObject): boolean {
        if (this.parent) {
            const transferAmount = Math.floor(obj.multiplicity * this.config.permeability);
            if (transferAmount > 0) {
                const transferObj = {
                    ...obj,
                    multiplicity: transferAmount
                };
                this.parent.addObject(transferObj);
                obj.multiplicity -= transferAmount;
                return true;
            }
        }
        return false;
    }
}

/**
 * Paun P-System for Membrane Computing with Reservoir Evolution
 */
export class PaunMembraneComputing {
    private rootMembrane: Membrane;
    private membraneRegistry: Map<string, Membrane>;
    private evolutionStep: number;

    constructor(rootConfig: MembraneConfig) {
        this.rootMembrane = new Membrane(rootConfig);
        this.membraneRegistry = new Map();
        this.membraneRegistry.set(rootConfig.id, this.rootMembrane);
        this.evolutionStep = 0;
    }

    /**
     * Create child membrane
     */
    public createMembrane(parentId: string, config: MembraneConfig): Membrane | null {
        const parent = this.membraneRegistry.get(parentId);
        if (!parent) return null;

        const membrane = new Membrane(config);
        membrane.parent = parent;
        parent.children.push(membrane);
        this.membraneRegistry.set(config.id, membrane);

        return membrane;
    }

    /**
     * Add evolution rule to membrane
     */
    public addRule(membraneId: string, rule: EvolutionRule): boolean {
        const membrane = this.membraneRegistry.get(membraneId);
        if (!membrane) return false;

        membrane.rules.push(rule);
        return true;
    }

    /**
     * Execute one evolution step across all membranes
     */
    public evolveSystem(): void {
        this.evolutionStep++;

        // Evolve all membranes in parallel
        const membranes = Array.from(this.membraneRegistry.values());
        for (const membrane of membranes) {
            membrane.evolve();
        }

        // Communicate between membranes
        this.communicateObjects();
    }

    /**
     * Handle object communication between membranes
     */
    private communicateObjects(): void {
        const membranes = Array.from(this.membraneRegistry.values());
        
        for (const membrane of membranes) {
            const objectsToTransfer: [MembraneObject, number][] = [];

            // Collect objects for transfer
            for (const obj of membrane.objects.values()) {
                if (obj.multiplicity > 1 && membrane.children.length > 0) {
                    // Transfer some objects to children based on permeability
                    const childIndex = Math.floor(Math.random() * membrane.children.length);
                    objectsToTransfer.push([obj, childIndex]);
                }
            }

            // Perform transfers
            for (const [obj, childIndex] of objectsToTransfer) {
                membrane.sendToChild(childIndex, obj);
            }
        }
    }

    /**
     * Get membrane by ID
     */
    public getMembrane(id: string): Membrane | undefined {
        return this.membraneRegistry.get(id);
    }

    /**
     * Get root membrane
     */
    public getRoot(): Membrane {
        return this.rootMembrane;
    }

    /**
     * Get current evolution step
     */
    public getEvolutionStep(): number {
        return this.evolutionStep;
    }

    /**
     * Get all membranes
     */
    public getAllMembranes(): Membrane[] {
        return Array.from(this.membraneRegistry.values());
    }

    /**
     * Get system state as nested structure
     */
    public getSystemState(): any {
        const buildState = (membrane: Membrane): any => ({
            id: membrane.config.id,
            depth: membrane.config.depth,
            objects: Array.from(membrane.objects.entries()).map(([type, obj]) => ({
                type,
                multiplicity: obj.multiplicity,
                stateSize: obj.state.length
            })),
            children: membrane.children.map(child => buildState(child))
        });

        return buildState(this.rootMembrane);
    }

    /**
     * Integrate with reservoir state
     */
    public integrateReservoirState(reservoirState: number[]): void {
        // Map reservoir state to membrane objects
        const stateChunks = this.chunkArray(reservoirState, 10);
        
        stateChunks.forEach((chunk, index) => {
            const obj: MembraneObject = {
                type: `reservoir_state_${index}`,
                multiplicity: Math.max(1, Math.floor(Math.abs(chunk[0]) * 10)),
                state: chunk
            };
            this.rootMembrane.addObject(obj);
        });
    }

    /**
     * Extract evolved state for reservoir
     */
    public extractEvolvedState(): number[] {
        const state: number[] = [];
        
        for (const obj of this.rootMembrane.objects.values()) {
            state.push(...obj.state);
            state.push(obj.multiplicity / 10); // Normalized multiplicity
        }

        return state;
    }

    private chunkArray(array: number[], size: number): number[][] {
        const chunks: number[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}

/**
 * Creates default P-System configuration for reservoir computing
 */
export function createReservoirMembraneSystem(reservoirSize: number): PaunMembraneComputing {
    const rootConfig: MembraneConfig = {
        id: "root",
        depth: 0,
        permeability: 0.3,
        evolutionRate: 0.1
    };

    const system = new PaunMembraneComputing(rootConfig);

    // Create child membranes for different reservoir aspects
    const membraneConfigs = [
        {id: "cognitive", depth: 1, permeability: 0.4, evolutionRate: 0.15},
        {id: "affective", depth: 1, permeability: 0.5, evolutionRate: 0.2},
        {id: "attention", depth: 1, permeability: 0.35, evolutionRate: 0.12}
    ];

    for (const config of membraneConfigs) {
        system.createMembrane("root", config);
    }

    // Add basic evolution rules
    system.addRule("root", {
        input: ["reservoir_state_0"],
        output: ["evolved_state_0"],
        condition: (state) => state.has("reservoir_state_0"),
        priority: 10
    });

    return system;
}
