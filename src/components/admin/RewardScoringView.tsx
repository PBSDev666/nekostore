import { useMemo } from 'react'
import { useProductStore } from '@/stores/productStore'
import type { RotationLevel } from '@/utils/rewardEngine'
import {
  calculateGrossMargin,
  calculateMarginPercentage,
  calculateRequiredPoints,
  calculateRewardScore,
  calculateRiskFactor,
  getCostScore,
  getMarginScore,
  getRewardEligibility,
  getRotationScore,
  getStockScore,
} from '@/utils/rewardEngine'

const ELIGIBILITY_LABELS: Record<string, string> = {
  free_reward: '✅ Gratis',
  reward_with_minimum_purchase: '🛒 Con compra mínima',
  partial_discount_only: '💰 Descuento parcial',
  not_eligible: '❌ No apto',
}

const ELIGIBILITY_CLASS: Record<string, string> = {
  free_reward: 'score-apto',
  reward_with_minimum_purchase: 'score-cuidado',
  partial_discount_only: 'score-riesgo',
  not_eligible: 'score-bloqueado',
}

const _RISK_LABELS: Record<string, string> = {
  free_reward: 'Bajo',
  reward_with_minimum_purchase: 'Medio',
  partial_discount_only: 'Alto',
  not_eligible: 'Muy alto',
}

export default function RewardScoringView() {
  const products = useProductStore((s) => s.items)

  const scored = useMemo(() => {
    return products
      .map((p) => {
        const stock = p.stock ?? 0
        const costPrice = p.costPrice ?? p.price * 0.5
        const rotation: RotationLevel =
          p.badge === 'BESTSELLER'
            ? 'alta'
            : p.badge === 'EXCLUSIVO'
              ? 'estrella'
              : stock > 20
                ? 'baja'
                : stock > 10
                  ? 'media'
                  : stock > 5
                    ? 'alta'
                    : 'estrella'
        const marginPercentage = calculateMarginPercentage(p.price, costPrice)
        const marginScore = getMarginScore(marginPercentage)
        const stockScore = getStockScore(stock)
        const rotationScore = getRotationScore(rotation)
        const costScore = getCostScore(costPrice)
        const rewardScore = calculateRewardScore({
          salePrice: p.price,
          productCost: costPrice,
          stock,
          rotation,
        })
        const eligibility = getRewardEligibility(rewardScore)
        const riskFactor = calculateRiskFactor({ marginPercentage, stock, rotation })
        const requiredPoints = calculateRequiredPoints({ productCost: costPrice, riskFactor })
        const grossMargin = calculateGrossMargin(p.price, costPrice)
        const marginPct = (marginPercentage * 100).toFixed(1)

        return {
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          cost: costPrice,
          grossMargin,
          marginPct,
          stock,
          rotation,
          rewardScore,
          eligibility,
          riskFactor: riskFactor.toFixed(1),
          requiredPoints,
          marginScore,
          stockScore,
          rotationScore,
          costScore,
        }
      })
      .sort((a, b) => b.rewardScore - a.rewardScore)
  }, [products])

  return (
    <div className='reward-scoring'>
      <h2>Evaluación de Rewards</h2>
      <p className='reward-scoring__subtitle'>
        {scored.length} productos evaluados | Score máximo: 100 | Apto desde 75
      </p>

      <div className='reward-scoring__legend'>
        <span className='legend-item'>
          <span className='legend-dot score-apto' /> Apto gratis
        </span>
        <span className='legend-item'>
          <span className='legend-dot score-cuidado' /> Con compra mínima
        </span>
        <span className='legend-item'>
          <span className='legend-dot score-riesgo' /> Solo descuento
        </span>
        <span className='legend-item'>
          <span className='legend-dot score-bloqueado' /> No apto
        </span>
      </div>

      <div className='reward-scoring__table-wrap'>
        <table className='reward-scoring__table'>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Costo</th>
              <th>Margen</th>
              <th>Stock</th>
              <th>Rotación</th>
              <th>
                Score
                <span
                  className='tooltip-trigger'
                  title='Margen 35% + Stock 25% + Rotación 20% + Costo 20%'
                >
                  {' '}
                  ⓘ
                </span>
              </th>
              <th>Elegibilidad</th>
              <th>
                Riesgo
                <span
                  className='tooltip-trigger'
                  title='Factor que ajusta puntos según margen, stock y rotación'
                >
                  {' '}
                  ⓘ
                </span>
              </th>
              <th>
                Pts req
                <span
                  className='tooltip-trigger'
                  title='(costo / ₡30) × factor riesgo, redondeado a bloques de 10'
                >
                  {' '}
                  ⓘ
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {scored.map((s) => (
              <tr key={s.id}>
                <td className='cell-name'>{s.name}</td>
                <td className='cell-num'>₡{s.price.toLocaleString()}</td>
                <td className='cell-num'>₡{s.cost.toLocaleString()}</td>
                <td className='cell-num'>
                  ₡{s.grossMargin.toLocaleString()}
                  <br />
                  <small>{s.marginPct}%</small>
                </td>
                <td className='cell-num'>{s.stock}</td>
                <td className='cell-rot'>{s.rotation}</td>
                <td className='cell-score'>
                  <div className={`score-bar ${ELIGIBILITY_CLASS[s.eligibility]}`}>
                    <div className='score-bar__fill' style={{ width: `${s.rewardScore}%` }} />
                    <span className='score-bar__label'>{s.rewardScore}</span>
                  </div>
                </td>
                <td className={`cell-elig ${ELIGIBILITY_CLASS[s.eligibility]}`}>
                  {ELIGIBILITY_LABELS[s.eligibility]}
                </td>
                <td className='cell-num'>{s.riskFactor}</td>
                <td className='cell-num cell-pts'>{s.requiredPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
