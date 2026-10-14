const skills = [
  {
    category: 'Frontend',
    tools: ['HTML', 'CSS', 'JavaScript', 'React'],
  },
  {
    category: 'Backend',
    tools: ['Python', 'Django', 'REST APIs', 'Firebase'],
  },
  {
    category: 'Mobile',
    tools: ['Kotlin', 'Android', 'Flutter'],
  },
  {
    category: 'Database',
    tools: ['PostgreSQL', 'Firestore', 'SQL'],
  },
  {
    category: 'Tools',
    tools: ['Git', 'GitHub', 'Linux', 'Termux'],
  },
]

function Skills() {
  return (
    <section className="section skills-section" id="skills">
      <div className="section-heading">
        <span className="section-number">04</span>
        <span className="section-label">Technology</span>
      </div>

      <div className="skills-intro">
        <h2>
          Tools for
          <span>building ideas.</span>
        </h2>

        <p>
          A practical technology stack for turning concepts into responsive
          interfaces, applications, APIs and complete digital systems.
        </p>
      </div>

      <div className="skills-list">
        {skills.map((group) => (
          <div className="skill-group" key={group.category}>
            <span className="skill-category">{group.category}</span>

            <div className="skill-tools">
              {group.tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
