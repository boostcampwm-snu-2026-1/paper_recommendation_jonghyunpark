// 관심분야 카탈로그 — 딥러닝/AI 토픽 위주.
// 각 토픽은 arXiv 검색에 쓰일 query(구문)를 가진다. 홈 피드는 선택한 토픽들을 OR로 묶어 조회한다.

export interface InterestTopic {
  /** 저장/식별용 slug */
  id: string
  /** 화면 표시 라벨 */
  label: string
  /** arXiv 검색 구문 (server topics 파라미터로 전달) */
  query: string
}

export interface InterestGroup {
  group: string
  topics: InterestTopic[]
}

export const INTEREST_GROUPS: InterestGroup[] = [
  {
    group: 'LLM & NLP',
    topics: [
      { id: 'llm', label: 'Large Language Models', query: 'large language model' },
      { id: 'multimodal-llm', label: 'Multimodal LLM', query: 'multimodal large language model' },
      { id: 'llm-reasoning', label: 'LLM Reasoning', query: 'language model reasoning' },
      { id: 'llm-agents', label: 'LLM Agents', query: 'language model agent' },
      { id: 'rag', label: 'Retrieval-Augmented Generation', query: 'retrieval augmented generation' },
    ],
  },
  {
    group: 'Vision & Generative',
    topics: [
      { id: 'vlm', label: 'Vision-Language Models', query: 'vision language model' },
      { id: 'diffusion', label: 'Diffusion Models', query: 'diffusion model' },
      { id: 'gaussian-splatting', label: '3D / Gaussian Splatting', query: 'gaussian splatting' },
      { id: 'video', label: 'Video Understanding', query: 'video understanding' },
    ],
  },
  {
    group: 'Robotics & Embodied',
    topics: [
      { id: 'robot-learning', label: 'Robot Learning', query: 'robot learning' },
      { id: 'vla', label: 'Vision-Language-Action', query: 'vision language action' },
      { id: 'imitation', label: 'Imitation Learning', query: 'imitation learning' },
    ],
  },
  {
    group: 'Learning Paradigms',
    topics: [
      { id: 'continual', label: 'Continual Learning', query: 'continual learning' },
      { id: 'rl', label: 'Reinforcement Learning', query: 'reinforcement learning' },
      { id: 'ssl', label: 'Self-Supervised Learning', query: 'self-supervised learning' },
      { id: 'few-shot', label: 'Few-shot / Meta Learning', query: 'few-shot learning' },
      { id: 'federated', label: 'Federated Learning', query: 'federated learning' },
    ],
  },
  {
    group: 'Efficiency & Others',
    topics: [
      { id: 'efficient-ml', label: 'Efficient ML / Quantization', query: 'model quantization' },
      { id: 'distillation', label: 'Knowledge Distillation', query: 'knowledge distillation' },
      { id: 'gnn', label: 'Graph Neural Networks', query: 'graph neural network' },
      { id: 'interpretability', label: 'Interpretability', query: 'interpretability' },
    ],
  },
]

/** 전체 토픽 평탄화 + id 조회 맵 */
export const ALL_TOPICS: InterestTopic[] = INTEREST_GROUPS.flatMap((g) => g.topics)
const TOPIC_BY_ID = new Map(ALL_TOPICS.map((t) => [t.id, t]))

export function getTopicLabel(id: string): string {
  return TOPIC_BY_ID.get(id)?.label ?? id
}

/**
 * 선택한 관심분야 id + 커스텀 키워드를 arXiv 검색 구문 배열로 변환.
 * server `/api/papers?topics=` 에 콤마로 join해서 넘긴다.
 */
export function interestsToQueries(interestIds: string[], customKeywords: string[]): string[] {
  const fromCatalog = interestIds
    .map((id) => TOPIC_BY_ID.get(id)?.query)
    .filter((q): q is string => Boolean(q))
  return [...fromCatalog, ...customKeywords]
}
