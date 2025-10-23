import {describe, it, expect} from "vitest";
import {
    DeepTreeEchoInferenceEngine,
    createDefaultDeepTreeEchoConfig,
    EmotionDimension,
    type DeepTreeEchoSelfState
} from "../../src/evaluator/reservoir/index.js";

describe("Deep Tree Echo State Network", () => {
    it("should create inference engine with default config", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const engine = new DeepTreeEchoInferenceEngine(config);
        
        expect(engine).toBeDefined();
        expect(engine.getConfig()).toMatchObject({
            esn: expect.objectContaining({
                reservoirSize: expect.any(Number),
                spectralRadius: expect.any(Number)
            })
        });
    });

    it("should process tokens through reservoir", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const engine = new DeepTreeEchoInferenceEngine(config);
        
        // Create sample tokens (simulating token IDs)
        const tokens = [100, 200, 300, 400, 500];
        
        const output = engine.processTokens(tokens);
        
        expect(output).toBeDefined();
        expect(Array.isArray(output)).toBe(true);
        expect(output.length).toBeGreaterThan(0);
    });

    it("should update emotional state", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const engine = new DeepTreeEchoInferenceEngine(config);
        
        // Process some tokens to generate state
        const tokens = [100, 200, 300];
        engine.processTokens(tokens);
        
        const state = engine.getEchoSelfState();
        
        expect(state.emotionalState).toBeDefined();
        expect(state.emotionalState.valence).toBeDefined();
        expect(state.emotionalState.arousal).toBeDefined();
        expect(state.emotionalState.dominance).toBeDefined();
    });

    it("should compute affective coherence", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const engine = new DeepTreeEchoInferenceEngine(config);
        
        // Process multiple token sequences
        for (let i = 0; i < 5; i++) {
            const tokens = [100 + i * 10, 200 + i * 10, 300 + i * 10];
            engine.processTokens(tokens);
        }
        
        const coherence = engine.getAffectiveCoherence();
        
        expect(coherence).toBeDefined();
        expect(typeof coherence).toBe("number");
        expect(coherence).toBeGreaterThanOrEqual(0);
        expect(coherence).toBeLessThanOrEqual(1);
    });

    it("should evolve persona based on feedback", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const engine = new DeepTreeEchoInferenceEngine(config);
        
        const initialPersona = {...engine.getConfig().persona};
        
        // Provide positive feedback
        engine.evolvePersona(0.5);
        
        const evolvedPersona = engine.getConfig().persona;
        
        // At least one trait should have changed
        const hasChanged = 
            initialPersona.emotionalExpressiveness !== evolvedPersona.emotionalExpressiveness ||
            initialPersona.creativity !== evolvedPersona.creativity ||
            initialPersona.empathy !== evolvedPersona.empathy;
        
        expect(hasChanged).toBe(true);
    });

    it("should maintain attention state", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const engine = new DeepTreeEchoInferenceEngine(config);
        
        const tokens = [100, 200, 300, 400, 500];
        engine.processTokens(tokens);
        
        const state = engine.getEchoSelfState();
        
        expect(state.attentionState).toBeDefined();
        expect(state.attentionState.focusIntensity).toBeDefined();
        expect(state.attentionState.contextRelevance).toBeDefined();
        expect(state.attentionState.focusIntensity).toBeGreaterThan(0);
        expect(state.attentionState.focusIntensity).toBeLessThanOrEqual(1);
    });

    it("should reset to initial state", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const engine = new DeepTreeEchoInferenceEngine(config);
        
        // Process tokens
        const tokens = [100, 200, 300];
        engine.processTokens(tokens);
        
        // Reset
        engine.reset();
        
        const state = engine.getEchoSelfState();
        
        expect(state.reservoirState).toEqual([]);
        expect(state.affectiveResonance).toBe(0);
    });
});

describe("Reservoir Components", () => {
    it("should initialize all components", () => {
        const config = createDefaultDeepTreeEchoConfig();
        
        expect(config.esn).toBeDefined();
        expect(config.rkRidge).toBeDefined();
        expect(config.jSurface).toBeDefined();
        expect(config.affectiveResonance).toBeDefined();
        expect(config.persona).toBeDefined();
        expect(config.character).toBeDefined();
    });

    it("should have valid persona traits", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const persona = config.persona;
        
        expect(persona.cognitiveStyle).toBeGreaterThanOrEqual(0);
        expect(persona.cognitiveStyle).toBeLessThanOrEqual(1);
        expect(persona.emotionalExpressiveness).toBeGreaterThanOrEqual(0);
        expect(persona.creativity).toBeGreaterThanOrEqual(0);
    });

    it("should have valid character traits", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const character = config.character;
        
        expect(character.openness).toBeGreaterThanOrEqual(0);
        expect(character.openness).toBeLessThanOrEqual(1);
        expect(character.conscientiousness).toBeGreaterThanOrEqual(0);
        expect(character.extraversion).toBeGreaterThanOrEqual(0);
    });

    it("should have valid ESN configuration", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const esn = config.esn;
        
        expect(esn.reservoirSize).toBeGreaterThan(0);
        expect(esn.spectralRadius).toBeGreaterThan(0);
        expect(esn.spectralRadius).toBeLessThan(1);
        expect(esn.leakRate).toBeGreaterThan(0);
        expect(esn.leakRate).toBeLessThan(1);
        expect(esn.treeDepth).toBeGreaterThan(0);
    });
});

describe("Emotion Theory Integration", () => {
    it("should map emotion dimensions correctly", () => {
        const dimensions = Object.values(EmotionDimension);
        
        expect(dimensions).toContain(EmotionDimension.Joy);
        expect(dimensions).toContain(EmotionDimension.Interest);
        expect(dimensions).toContain(EmotionDimension.Fear);
        expect(dimensions).toContain(EmotionDimension.Sadness);
    });

    it("should compute VAD (Valence-Arousal-Dominance) model", () => {
        const config = createDefaultDeepTreeEchoConfig();
        const engine = new DeepTreeEchoInferenceEngine(config);
        
        // Process tokens to generate emotional state
        const tokens = [100, 200, 300];
        engine.processTokens(tokens);
        
        const emotionalState = engine.getEchoSelfState().emotionalState;
        
        // VAD values should be defined
        expect(emotionalState.valence).toBeDefined();
        expect(emotionalState.arousal).toBeDefined();
        expect(emotionalState.dominance).toBeDefined();
        
        // VAD values should be numbers
        expect(typeof emotionalState.valence).toBe("number");
        expect(typeof emotionalState.arousal).toBe("number");
        expect(typeof emotionalState.dominance).toBe("number");
    });
});
