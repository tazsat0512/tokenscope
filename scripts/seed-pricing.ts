import { PRICING_TABLE } from '@tokenscope/shared';

// Script to verify and display all pricing data
console.log('TokenScope Pricing Table');
console.log('========================\n');

const models = Object.entries(PRICING_TABLE).sort(([a], [b]) => a.localeCompare(b));

console.log(`Total models: ${models.length}\n`);

console.log('| Model | Input ($/M) | Output ($/M) |');
console.log('|-------|-------------|--------------|');

for (const [model, pricing] of models) {
  console.log(
    `| ${model.padEnd(40)} | $${pricing.inputPerMillion.toFixed(3).padStart(8)} | $${pricing.outputPerMillion.toFixed(3).padStart(9)} |`,
  );
}

console.log(`\nTotal: ${models.length} models`);
