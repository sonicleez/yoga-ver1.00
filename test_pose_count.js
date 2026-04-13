/**
 * TEST: Verify buildPoseSequence returns EXACT poseCount
 * Run: node --experimental-vm-modules test_pose_count.js
 *   OR: node test_pose_count.mjs (rename if needed)
 */

import { buildPoseSequence } from './src/modules/scriptGenerator/flowStrategies.js';

const FLOWS = ['progressive', 'warm_to_cool', 'cool_to_warm', 'body_scan', 'chakra', 'themed_animals', 'random'];
const COUNTS = [6, 8, 9, 10, 12, 15, 20];
const LEVELS = ['beginner', 'intermediate'];

let passed = 0;
let failed = 0;

console.log('═'.repeat(60));
console.log('  POSE COUNT CORRECTNESS TEST');
console.log('═'.repeat(60));

for (const flow of FLOWS) {
    for (const count of COUNTS) {
        for (const level of LEVELS) {
            const result = buildPoseSequence({
                poseCount: count,
                flow,
                level,
                audience: 'adults',
                focusArea: 'relaxation',
                exclude: [],
                mustInclude: ['savasana'],
            });

            const ok = result.length === count;
            if (ok) {
                passed++;
            } else {
                failed++;
                console.log(`❌ FAIL: flow=${flow}, count=${count}, level=${level} → got ${result.length}`);
            }
        }
    }
}

console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`\nTotal: ${passed + failed} test cases`);

if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED — pose count is now always exact!');
} else {
    console.log('\n⚠️  Some tests failed. Check the log above.');
}
