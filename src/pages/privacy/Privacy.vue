<template>
  <NavBar/>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-10 col-sm-8 col-md-6">
        <h1 style="margin-bottom: 1em"> BRAVO Privacy Policy </h1>
        Last Revision Date — June 28, 2023
        <p> The University of Michigan School of Public Health (SPH) operates the BRAVO website, which provides the SERVICE of the same name.
        </p>
        <h2> Overview </h2>
        <p> In principle, the School of Public Health of the University of Michigan strives to:
          <ul>
            <li> Collect, store and use the minimum amount of personal information that is necessary for its legitimate business purposes, and to comply with applicable legal obligations.  
            </li>
            <li> Take reasonable steps to ensure the personal information we manage is accurate and up-to-date.
Limit who has access to the personal information in our possession to only those who need it for a legitimate, specific purpose.
            </li>
            <li> Protect personal information through appropriate physical and technical security measures tailored to the sensitivity of the personal data we hold.
            </li>
            <li> Communicate with our students, faculty, employees, suppliers, partners and others about how we use personal information in our day-to-day operations.
            </li>
            <li> Provide opportunities to control your personal information, as permitted by applicable United States and other laws.
Consider privacy principles in the design of our projects or activities that involve the use of personal data.
            </li>
          </ul>
        </p>
        <h2> Scope </h2>
        <p> This privacy statement is applicable to the activities and software used to provide the BRAVO service. 
        </p>
        <h2>Personal Information We Collect and Use </h2>
        <p> For a better experience while using our Service, we may require you to provide us with certain personally identifiable information, including but not limited to your email address. The information that we collect is used for identity and authorization with the Service, and may be used to contact you.
        </p>
        <h2>How We Use Personal Information</h2>
        <p> The SPH only use your personal information for legitimate and specific purposes and to facilitate the operation of the Service.
        </p>
        <h2>Who Has Access to Your Information</h2>
        <p> The SPH does not sell your information to third parties, and does not share it with third parties for purposes other than supporting the legitimate operations of the Service.
        </p>
        <h2>How We Secure Your Information</h2>
        <p> The SPH recognizes the importance of maintaining the security of the information it collects and maintains, and we endeavor to protect information from unauthorized access and damage. The SPH strives to ensure reasonable security measures are in place, including physical, administrative, and technical safeguards to protect your personal information.
        </p>

        <h2>Privacy Statement Changes</h2>
        <p> This privacy statement may be updated from time to time. We will post the date of last update at the top of this page.
        </p>
        <h2>Who to Contact with Questions or Concerns</h2>
        <p> If you have any concerns or questions about how your personal data is used, please contact us at bravo-group@umich.edu. You can also contact us at 1415 Washington Heights, Ann Arbor, MI 48109.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '../../components/NavBar.vue'
import axios from 'axios'
import {inject} from 'vue'

export default {
  name: 'App',
  components: {NavBar},
}
</script>
