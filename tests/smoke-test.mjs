// Run with: node tests/smoke-test.mjs
// Browser module imports need no DOM for generators and identifier helpers.
import assert from "node:assert/strict";
import {canonicalId,incrementDecimal,compareDecimal} from "../modules/identifiers.js";
import {generateGalaxy,generatePlanet,generateProfile} from "../modules/generators.js";
const huge="999999999999999999999999999999999999999999999999999999999999999999999999";
assert.equal(canonicalId("00012"),"12");
assert.equal(incrementDecimal(huge),"1"+"0".repeat(huge.length));
assert.equal(compareDecimal("999999999999999999999","1000000000000000000000"),-1);
assert.deepEqual(generateGalaxy("42"),generateGalaxy("42"));
assert.notEqual(generateGalaxy("42").key,generateGalaxy("43").key);
assert.deepEqual(generatePlanet("7","42"),generatePlanet("7","42"));
assert.notEqual(generatePlanet("7","42").key,generatePlanet("8","42").key);
assert.deepEqual(generateProfile("7","8","42"),generateProfile("7","8","42"));
assert.notEqual(generateProfile("7","8","42").key,generateProfile("7","9","42").key);
assert.equal(generateProfile("7","8",huge).id,huge);
console.log("ZYRAVANTH smoke tests passed.");
