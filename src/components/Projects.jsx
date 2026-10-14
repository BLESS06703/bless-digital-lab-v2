import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { projects } from '../data/projects'

const filters = ['All', 'Web', 'Apps', 'Systems']

function Projects() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((project) => project.category === activeFilter)

  return (
    <section className="section projects-section" id="work">
      <div className="section-heading">
        <span className="section-number">03</span>
        <span className="section-label">Selected work</span>
      </div>

      <div className="projects-intro">
        <div>
          <h2>
            Work that
            <span>solves problems.</span>
          </h2>
        </div>

        <p>
          A selection of digital products, applications and experiences
          developed around practical problems and real-world use cases.
        </p>
      </div>

      <div className="project-filters">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? 'active' : ''}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="projects-list">
        {filteredProjects.map((project) => (
          <article className="project-row" key={project.id}>
            <div className="project-index">
              {String(project.id).padStart(2, '0')}
            </div>

            <div className="project-visual">
              <div className="project-visual-grid" />
              <span>{project.title.substring(0, 1)}</span>

              <div className="project-visual-label">
                {project.category}
              </div>
            </div>

            <div className="project-details">
              <span className="project-type">{project.type}</span>

              <h3>{project.title}</h3>

              <p>{project.description}</p>

              <div className="project-tech">
                {project.technologies.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
            </div>

            <a
              className="project-link"
              href="#contact"
              aria-label={`Discuss ${project.title}`}
            >
              <ArrowUpRight size={22} />
            </a>
          </article>
        ))}
      </div>

      <div className="projects-footer">
        <span>More projects coming</span>

        <a href="#contact">
          Have a project in mind?
          <ArrowUpRight size={17} />
        </a>
      </div>
    </section>
  )
}

export default Projects
