import { investmentsData } from "../../../data/investments"

const InvestmentsPage = () => {
  return (
    <div>
      <h1>Investments</h1>
      <ul>
        {investmentsData.map((investment) => (
          <li key={investment.id}>
            {investment.name} - {investment.amount}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default InvestmentsPage
