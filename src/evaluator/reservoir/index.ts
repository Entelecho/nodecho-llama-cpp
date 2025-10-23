/**
 * Deep Tree Echo State Network Reservoir Computing Framework
 * 
 * Integrates node-llama-cpp inference engine with:
 * - Deep Tree Echo State Networks with Affective Resonance
 * - Paun P-System Membrane Computing for Reservoir Evolution
 * - Butcher B-Series Rooted Forest Runge-Kutta Ridge Regression
 * - Julia J-Surface Elementary Differential Ricci Flow Equations
 * - Differential Emotion Theory Framework with Affective Agency
 * - LLM Persona & Character Traits mapping to Hyper-Parameter Architecture
 * - Cognitive Attention Mechanism integration
 */

export {
    DeepTreeEchoStateNetwork,
    ReservoirNode,
    type DeepTreeESNConfig
} from "./DeepTreeEchoStateNetwork.js";

export {
    PaunMembraneComputing,
    Membrane,
    createReservoirMembraneSystem,
    type MembraneConfig,
    type MembraneObject,
    type EvolutionRule
} from "./PaunMembraneComputing.js";

export {
    ButcherBSeriesRootedForest,
    RKRidgeRegression,
    createDefaultRKRidgeConfig,
    type ButcherTableau,
    type RootedTree,
    type RKRidgeConfig
} from "./ButcherBSeriesRK.js";

export {
    JuliaJSurface,
    DifferentialEmotionTheory,
    MetricTensor,
    EmotionDimension,
    createDefaultJSurfaceConfig,
    type EmotionalState,
    type RicciFlowParams,
    type JSurfaceConfig
} from "./JuliaJSurfaceEmotionTheory.js";

export {
    DeepTreeEchoInferenceEngine,
    createDefaultDeepTreeEchoConfig,
    type DeepTreeEchoInferenceConfig,
    type LLMPersonaTraits,
    type CharacterTraits,
    type AffectiveResonanceConfig,
    type CognitiveAttentionState,
    type DeepTreeEchoSelfState
} from "./DeepTreeEchoInference.js";
